// server/src/services/game.service.ts
import { GameEngine, Command, GameEvent } from '../game/gameEngine';
import { ipcEmitter } from './ipc.emitter';

class GameService {
  private gameEngine: GameEngine;

  constructor() {
    // The broadcast callback is now handled by publishing events to the IPC emitter
    this.gameEngine = new GameEngine(this.publishEvents.bind(this));
    this.listenForCommands();
    console.log('✅ Game Service Initialized');
  }

  private listenForCommands() {
    ipcEmitter.on('command', async (characterId: string, command: Command) => {
      const responseEvents = await this.gameEngine.processCommand(characterId, command);
      this.publishEvents(responseEvents);
    });

    ipcEmitter.on('characterConnected', async (characterId: string) => {
        const initialEvents = await this.gameEngine.handleCharacterConnect(characterId);
        this.publishEvents(initialEvents);
    });

    ipcEmitter.on('characterDisconnected', async (characterId: string) => {
        const departureEvent = await this.gameEngine.handleCharacterDisconnect(characterId);
        if (departureEvent) {
            this.publishEvents([departureEvent]);
        }
    });
  }

  private async publishEvents(events: GameEvent[]) {
    const processedEvents = [];
    for (const event of events) {
        if (event.target === 'room') {
            const charactersInRoom = await this.gameEngine.getCharactersInRoom(event.payload.roomId, event.payload.exclude?.[0]);
            for (const char of charactersInRoom) {
                processedEvents.push({ ...event, target: char.id });
            }
        } else {
            processedEvents.push(event);
        }
    }
    ipcEmitter.emit('events', processedEvents);
  }

  public start() {
    // In the future, this could start a game tick or other periodic tasks.
  }
}

export const gameService = new GameService();
export const gameEngine = gameService['gameEngine'];
