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
import { MapPanel } from './MapPanel';
import { SpellbookPanel } from './SpellbookPanel';
import { AbilitiesPanel } from './AbilitiesPanel';
import { Quickbar } from './Quickbar';
import { Grid, Flex, Box } from '@chakra-ui/react';
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
    { label: 'Spellbook', content: <SpellbookPanel /> },
    { label: 'Abilities', content: <AbilitiesPanel /> },
  ];
  
  const rightPanelTabs = [
    { label: 'Equipped', content: <AvatarPanel /> },
    { label: 'Backpack', content: <InventoryPanel /> },
    { label: 'Quests', content: <div>Quest Log Coming Soon!</div> },
  ];

  if (!player || !room) {
    return <div className="loading-screen">Entering NightfallMUD...</div>;
  }

  return (
    <>
      {isLevelUpVisible && player && (
        <LevelUpModal player={player} onConfirm={handleConfirmLevelUp} onCancel={() => setIsLevelUpVisible(false)} />
      )}
      <Grid
        templateColumns={{ base: '1fr', md: '320px 1fr 320px' }}
        templateRows="1fr"
        h="calc(100vh - 50px)"
        w="100vw"
        gap={3}
        p={3}
        bg="gray.900"
      >
        {/* Left Panel */}
        <Flex
          direction="column"
          overflow="hidden"
          gridColumn={{ base: '1', md: '1' }}
          gridRow="1"
          minW="0"
          gap={3}
        >
          <VitalsPanel />
          <Quickbar />
          <TabbedView tabs={leftPanelTabs} />
        </Flex>
        {/* Main Panel */}
        <Flex
          direction="column"
          overflow="hidden"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="lg"
          gridColumn={{ base: '1', md: '2' }}
          gridRow="1"
          minW="0"
        >
          <CombatPanel />
          <RoomInfoPanel />
          <Box flex="1" minH={0} display="flex" flexDirection="column">
            <MessageLogPanel />
          </Box>
          <Box mt="auto">
            <InputPanel />
          </Box>
        </Flex>
        {/* Right Panel */}
        <Flex
          direction="column"
          overflow="hidden"
          gridColumn={{ base: '1', md: '3' }}
          gridRow="1"
          minW="0"
        >
          <MapPanel />
          <TabbedView tabs={rightPanelTabs} />
        </Flex>
      </Grid>
    </>
  );
}
