// client/src/components/Game.tsx
import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { StatsPanel } from './StatsPanel';
import { InventoryPanel } from './InventoryPanel';
import { LevelUpModal } from './LevelUpModal';
import { AvatarPanel } from './AvatarPanel';
import { TabbedView } from './TabbedView';
import { CombatPanel } from './CombatPanel';
import { MessageLogPanel } from './MessageLogPanel';
import { RoomInfoPanel } from './RoomInfoPanel';
import { InputPanel } from './InputPanel';
import { VitalsPanel } from './VitalsPanel';
import { MapPanel } from './MapPanel'; // <-- Import the new MapPanel
import type { Player } from '../types';

// --- Interfaces ---
interface GamePayload {
  message: string;
  player?: Player;
  room?: any;
  mobs?: any[];
  players?: string[];
  roomItems?: any[];
  inventory?: any[];
  inCombat?: boolean;
  zoneRooms?: any[]; // For the map
}
interface ServerMessage { type: 'gameUpdate' | 'message'; payload: GamePayload; }
interface GameProps { token: string; characterId: string; }

export function Game({ token, characterId }: GameProps) {
  const {
    setSocket, handleGameUpdate, addMessage, sendCommand, resetRound,
    player, room, inCombat
  } = useGameStore();

  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);

  useEffect(() => {
    if (player && player.unspentStatPoints > 0) {
      setIsLevelUpVisible(true);
    } else {
      setIsLevelUpVisible(false);
    }
  }, [player]);

  useEffect(() => {
    if (inCombat) {
      resetRound();
    }
  }, [player, inCombat, resetRound]);

  useEffect(() => {
    const WS_URL = (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001') + `?token=${token}`;
    const socket = new WebSocket(WS_URL);
    setSocket(socket);
    socket.onopen = () => { sendCommand({ action: 'selectCharacter', payload: characterId }); };
    socket.onmessage = (event) => {
      const serverMessage: ServerMessage = JSON.parse(event.data);
      if (serverMessage.type === 'gameUpdate') {
        handleGameUpdate(serverMessage.payload);
      } else if (serverMessage.type === 'message' && serverMessage.payload.message) {
        addMessage(serverMessage.payload.message);
      }
    };
    socket.onclose = () => { addMessage("Connection to server lost."); };
    return () => { socket.close(); };
  }, [token, characterId, setSocket, sendCommand, handleGameUpdate, addMessage]);

  const handleConfirmLevelUp = (assignedPoints: Record<string, number>) => {
    sendCommand({ action: 'assignStats', payload: assignedPoints });
    setIsLevelUpVisible(false);
  };

  const leftPanelTabs = [
    { label: 'Attributes', content: <StatsPanel onLevelUpClick={() => setIsLevelUpVisible(true)} /> },
    { label: 'Equipped', content: <AvatarPanel /> },
  ];
  
  // --- UPDATED: The MapPanel is now in place ---
  const rightPanelTabs = [
    { label: 'Backpack', content: <InventoryPanel /> },
    { label: 'Quests', content: <div>Quest Log Coming Soon!</div> },
    { label: 'Map', content: <MapPanel /> },
  ];

  if (!player || !room) {
    return <div className="loading-screen">Entering NightfallMUD...</div>;
  }

  return (
    <>
      {isLevelUpVisible && player && (
        <LevelUpModal player={player} onConfirm={handleConfirmLevelUp} onCancel={() => setIsLevelUpVisible(false)} />
      )}
      <div className="game-layout">
        <div className="side-panel left-panel">
          <VitalsPanel />
          <TabbedView tabs={leftPanelTabs} />
        </div>
        <div className="main-panel">
          <RoomInfoPanel />
          <CombatPanel />
          <MessageLogPanel />
          <InputPanel />
        </div>
        <div className="side-panel right-panel">
          <TabbedView tabs={rightPanelTabs} />
        </div>
      </div>
    </>
  );
}
