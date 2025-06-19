// client/src/stores/useGameStore.ts
import { create } from 'zustand';
import type { Player, Item, Mob, Room } from '../types';

// Define the shape of our state
interface GameState {
  player: Player | null;
  room: Room | null;
  mobsInRoom: Mob[];
  playersInRoom: string[];
  roomItems: Item[];
  inventory: Item[];
  zoneRooms: Room[]; 
  
  inCombat: boolean;
  isActionDisabled: boolean;
  roundTimerKey: number;
  messages: string[];
  socket: WebSocket | null;
  lastUpdate: number;
}

// Define the actions that can modify our state
interface GameActions {
  setSocket: (socket: WebSocket) => void;
  handleGameUpdate: (payload: any) => void;
  addMessage: (message: string) => void;
  sendCommand: (command: any) => void;
  resetRound: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // --- INITIAL STATE ---
  player: null,
  room: null,
  mobsInRoom: [],
  playersInRoom: [],
  roomItems: [],
  inventory: [],
  zoneRooms: [], 
  inCombat: false,
  isActionDisabled: false,
  roundTimerKey: 0,
  messages: [],
  socket: null,
  lastUpdate: 0,

  // --- ACTIONS ---
  setSocket: (socket) => set({ socket }),

  handleGameUpdate: (payload) => {
    const updates: Partial<GameState> = {};

    if (payload.player !== undefined) updates.player = payload.player;
    if (payload.room !== undefined) updates.room = payload.room;
    if (payload.mobs !== undefined) updates.mobsInRoom = payload.mobs;
    if (payload.players !== undefined) updates.playersInRoom = payload.players;
    if (payload.roomItems !== undefined) updates.roomItems = payload.roomItems;
    if (payload.inventory !== undefined) updates.inventory = payload.inventory;
    if (payload.inCombat !== undefined) updates.inCombat = payload.inCombat;
    if (payload.zoneRooms !== undefined) updates.zoneRooms = payload.zoneRooms; // <-- ADDED
    
    updates.lastUpdate = Date.now();

    if (payload.message && payload.message.trim() !== '') {
      set(state => ({ messages: [...state.messages, payload.message] }));
    }

    set(updates);
  },

  addMessage: (message) => {
    set(state => ({ messages: [...state.messages, message] }));
  },
  
  sendCommand: (command) => {
    const { socket, inCombat } = get();
    if (socket?.readyState === WebSocket.OPEN) {
      if (inCombat) {
        set({ isActionDisabled: true });
      }
      socket.send(JSON.stringify(command));
    }
  },

  resetRound: () => {
    set(state => ({
      isActionDisabled: false,
      roundTimerKey: state.roundTimerKey + 1,
    }));
  },
}));
