import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { SpellService } from '../game/spell.service';

const prisma = new PrismaClient();
const spellService = new SpellService(prisma);
const router = Router();

// This middleware protects all routes defined in this file.
router.use(authMiddleware);

// GET /api/character/:id/spellbook - Get all spells known by a character
const handleGetSpellbook = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  const { id: characterId } = req.params;

  try {
    // Verify the character belongs to the authenticated user
    const character = await prisma.character.findFirst({
      where: { 
        id: characterId, 
        accountId: req.user.accountId 
      }
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found or does not belong to this account.' });
    }

    const characterSpells = await spellService.getCharacterSpells(characterId);
    
    res.json({
      characterId,
      spells: characterSpells.map(cs => ({
        id: (cs.spell as any).id,
        name: (cs.spell as any).name,
        description: (cs.spell as any).description,
        manaCost: (cs.spell as any).manaCost,
        targetType: (cs.spell as any).targetType,
        castingTime: (cs.spell as any).castingTime,
        cooldown: (cs.spell as any).cooldown,
        effects: (cs.spell as any).effects,
        cooldownUntil: (cs as any).cooldownUntil,
        learnedAt: (cs as any).learnedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching spellbook:", error);
    res.status(500).json({ message: 'Failed to fetch spellbook.' });
  }
};

// GET /api/character/:id/available-spells - Get spells the character can learn
const handleGetAvailableSpells = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  const { id: characterId } = req.params;

  try {
    // Verify the character belongs to the authenticated user
    const character = await prisma.character.findFirst({
      where: { 
        id: characterId, 
        accountId: req.user.accountId 
      }
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found or does not belong to this account.' });
    }

    const availableSpells = await spellService.getAvailableSpellsForCharacter(characterId);
    
    res.json({
      characterId,
      availableSpells: availableSpells.map(spell => ({
        id: (spell as any).id,
        name: (spell as any).name,
        description: (spell as any).description,
        spellType: (spell as any).spellType,
        requiredClass: (spell as any).requiredClass,
        requiredLevel: (spell as any).requiredLevel,
        manaCost: (spell as any).manaCost,
        targetType: (spell as any).targetType,
        castingTime: (spell as any).castingTime,
        cooldown: (spell as any).cooldown,
        effects: (spell as any).effects
      }))
    });
  } catch (error) {
    console.error("Error fetching available spells:", error);
    res.status(500).json({ message: 'Failed to fetch available spells.' });
  }
};

// POST /api/character/:id/learn-spell - Learn a new spell
const handleLearnSpell = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  const { id: characterId } = req.params;
  const { spellId } = req.body;

  if (!spellId) {
    return res.status(400).json({ message: 'Spell ID is required.' });
  }

  try {
    // Verify the character belongs to the authenticated user
    const character = await prisma.character.findFirst({
      where: { 
        id: characterId, 
        accountId: req.user.accountId 
      }
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found or does not belong to this account.' });
    }

    // Check if character can learn the spell
    const canLearn = await spellService.canLearnSpell(characterId, spellId);
    if (!canLearn) {
      return res.status(400).json({ message: 'Cannot learn this spell. Check level requirements and class restrictions.' });
    }

    // Learn the spell
    const characterSpell = await spellService.learnSpell(characterId, spellId);
    
    // Get the spell details
    const spell = await spellService.getSpellById(spellId);
    
    res.status(201).json({
      message: 'Spell learned successfully.',
      characterSpell: {
        id: characterSpell.id,
        characterId: characterSpell.characterId,
        spellId: characterSpell.spellId,
        learnedAt: characterSpell.learnedAt,
        spell: spell
      }
    });
  } catch (error) {
    console.error("Error learning spell:", error);
    res.status(500).json({ message: 'Failed to learn spell.' });
  }
};

// POST /api/character/:id/cast-spell - Cast a spell
const handleCastSpell = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  const { id: characterId } = req.params;
  const { spellId, targetId, targetType } = req.body;

  if (!spellId) {
    return res.status(400).json({ message: 'Spell ID is required.' });
  }

  try {
    // Verify the character belongs to the authenticated user
    const character = await prisma.character.findFirst({
      where: { 
        id: characterId, 
        accountId: req.user.accountId 
      }
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found or does not belong to this account.' });
    }

    // Check if character knows the spell
    const characterSpells = await spellService.getCharacterSpells(characterId);
    const knownSpell = characterSpells.find(cs => (cs.spell as any).id === spellId);
    
    if (!knownSpell) {
      return res.status(400).json({ message: 'You do not know this spell.' });
    }

    // Check if spell is on cooldown
    const isOnCooldown = await spellService.isSpellOnCooldown(characterId, spellId);
    if (isOnCooldown) {
      return res.status(400).json({ message: 'This spell is on cooldown.' });
    }

    // Check if character has enough mana
    const hasEnoughMana = await spellService.hasEnoughMana(characterId, spellId);
    if (!hasEnoughMana) {
      return res.status(400).json({ message: 'Not enough mana to cast this spell.' });
    }

    // TODO: Integrate with combat system
    // For now, just consume mana and set cooldown
    await spellService.consumeMana(characterId, spellId);
    await spellService.setSpellCooldown(characterId, spellId, (knownSpell.spell as any).cooldown);

    res.json({
      message: 'Spell cast successfully.',
      spell: {
        id: (knownSpell.spell as any).id,
        name: (knownSpell.spell as any).name,
        manaCost: (knownSpell.spell as any).manaCost,
        cooldown: (knownSpell.spell as any).cooldown
      },
      remainingMana: character.mana - (knownSpell.spell as any).manaCost
    });
  } catch (error) {
    console.error("Error casting spell:", error);
    res.status(500).json({ message: 'Failed to cast spell.' });
  }
};

// --- Attaching Handlers to the Router ---
router.get('/character/:id/spellbook', handleGetSpellbook);
router.get('/character/:id/available-spells', handleGetAvailableSpells);
router.post('/character/:id/learn-spell', handleLearnSpell);
router.post('/character/:id/cast-spell', handleCastSpell);

export default router; 