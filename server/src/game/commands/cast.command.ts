import { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import { Command, GameEvent } from '../gameEngine';
import { SpellService } from '../spell.service';
import { PrismaClient } from '@prisma/client';

export class CastCommand implements ICommandHandler {
  private spellService: SpellService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.spellService = new SpellService(this.prisma);
  }

  async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const { spellName, targetId, targetType } = command.payload || {};

    if (!spellName) {
      return [{ target: character.id, type: 'message', payload: { message: 'Usage: cast <spell_name> [target]' } }];
    }

    try {
      // Get the spell by name
      const spell = await this.spellService.getSpellByName(spellName);
      if (!spell) {
        return [{ target: character.id, type: 'message', payload: { message: `You don't know a spell called "${spellName}".` } }];
      }

      // Check if character knows this spell
      const characterSpells = await this.spellService.getCharacterSpells(character.id);
      const knownSpell = characterSpells.find(cs => (cs.spell as any).name === spellName);
      
      if (!knownSpell) {
        return [{ target: character.id, type: 'message', payload: { message: `You don't know the spell "${spellName}".` } }];
      }

      // Check if spell is on cooldown
      const isOnCooldown = await this.spellService.isSpellOnCooldown(character.id, (spell as any).id);
      if (isOnCooldown) {
        return [{ target: character.id, type: 'message', payload: { message: `The spell "${spellName}" is on cooldown.` } }];
      }

      // Check if character has enough mana
      const hasEnoughMana = await this.spellService.hasEnoughMana(character.id, (spell as any).id);
      if (!hasEnoughMana) {
        return [{ target: character.id, type: 'message', payload: { message: `You don't have enough mana to cast "${spellName}".` } }];
      }

      // Validate target based on spell target type
      let target: any = null;
      if ((spell as any).targetType === 'TARGET_ENEMY' || (spell as any).targetType === 'TARGET_ALLY') {
        if (!targetId) {
          return [{ target: character.id, type: 'message', payload: { message: `You need to specify a target for "${spellName}".` } }];
        }

        // Find target (could be mob or character)
        const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId: character.currentRoomId } });
        const charactersInRoom = await context.getCharactersInRoom(character.currentRoomId, character.id);
        
        target = mobsInRoom.find(m => m.id === targetId) || charactersInRoom.find(c => c.id === targetId);
        
        if (!target) {
          return [{ target: character.id, type: 'message', payload: { message: `Target not found.` } }];
        }

        // Validate target type
        if ((spell as any).targetType === 'TARGET_ENEMY' && !('experienceAward' in target)) {
          return [{ target: character.id, type: 'message', payload: { message: `You can only target enemies with "${spellName}".` } }];
        }
        if ((spell as any).targetType === 'TARGET_ALLY' && 'experienceAward' in target) {
          return [{ target: character.id, type: 'message', payload: { message: `You can only target allies with "${spellName}".` } }];
        }
      }

      // Consume mana
      await this.spellService.consumeMana(character.id, (spell as any).id);

      // Set cooldown
      await this.spellService.setSpellCooldown(character.id, (spell as any).id, (spell as any).cooldown);

      // Queue spell action in combat
      if (context.combatManager.isCharacterInCombat(character.id)) {
        // If in combat, queue the spell action
        context.combatManager.queueSpellAction(character, (spell as any).id, target?.id || null, (spell as any).castingTime);
        
        const castingMessage = (spell as any).castingTime === 0 ? 
          `You cast ${spellName}!` : 
          `You begin casting ${spellName}...`;
        
        return [{ target: character.id, type: 'message', payload: { message: castingMessage } }];
      } else {
        // If not in combat, resolve immediately
        const spellEffects = await this.resolveSpellEffects(character, spell, target, context);
        return spellEffects;
      }

    } catch (error) {
      console.error('Error casting spell:', error);
      return [{ target: character.id, type: 'message', payload: { message: 'An error occurred while casting the spell.' } }];
    }
  }

  private async resolveSpellEffects(character: CharacterWithRelations, spell: any, target: any, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const effectiveStats = context.attributeService.getEffectiveStats(character);

    for (const effect of (spell as any).effects) {
      switch (effect.effectType) {
        case 'DIRECT_DAMAGE':
          if (target && 'hp' in target) {
            const damage = Math.max(1, effect.baseValue + (effectiveStats.intelligence * effect.scalingFactor));
            target.hp -= damage;
            events.push({
              target: 'room',
              type: 'message',
              payload: {
                roomId: character.currentRoomId,
                message: `${character.name}'s ${(spell as any).name} hits ${target.name} for ${damage} damage!`,
                exclude: []
              }
            });
          }
          break;

        case 'HEAL':
          if (target && 'hp' in target) {
            const healing = Math.max(1, effect.baseValue + (effectiveStats.wisdom * effect.scalingFactor));
            const oldHp = target.hp;
            target.hp = Math.min(target.hp + healing, target.maxHp || target.hp);
            const actualHealing = target.hp - oldHp;
            events.push({
              target: 'room',
              type: 'message',
              payload: {
                roomId: character.currentRoomId,
                message: `${character.name}'s ${(spell as any).name} heals ${target.name} for ${actualHealing} health!`,
                exclude: []
              }
            });
          }
          break;

        case 'APPLY_STATUS_EFFECT':
          if (target && effect.statusEffect) {
            events.push({
              target: 'room',
              type: 'message',
              payload: {
                roomId: character.currentRoomId,
                message: `${character.name}'s ${(spell as any).name} applies ${effect.statusEffect.name} to ${target.name}!`,
                exclude: []
              }
            });
            // TODO: Implement status effect application
          }
          break;
      }
    }

    // Update target in database if it's a character
    if (target && 'experienceToNextLevel' in target) {
      await this.prisma.character.update({
        where: { id: target.id },
        data: { hp: target.hp }
      });
    }

    return events;
  }
} 