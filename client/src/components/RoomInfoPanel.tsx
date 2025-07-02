// client/src/components/RoomInfoPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { Hostility } from '../types';
import type { Mob, Item } from '../types';
import { Box, Heading, Text, Button, Group, Flex } from '@chakra-ui/react';
import { GameTooltip } from './GameTooltip';

export function RoomInfoPanel() {
  const room = useGameStore(state => state.room);
  const mobsInRoom = useGameStore(state => state.mobsInRoom);
  const roomItems = useGameStore(state => state.roomItems);
  const playersInRoom = useGameStore(state => state.playersInRoom);
  const sendCommand = useGameStore(state => state.sendCommand);

  const handleCommandClick = (action: string, payload: string) => {
    sendCommand({ action: action.toLowerCase(), payload: payload.toLowerCase() });
  };
  
  // Mock player class mapping (replace with real class info when available)
  const playerClassMap: Record<string, string> = {
    'Alice': 'VANGUARD',
    'Bob': 'AETHER_WEAVER',
    'Charlie': 'SHADOWBLADE',
    'Diana': 'DAWNKEEPER',
    'Eve': 'TECHNOMANCER',
    'Frank': 'GLOOM_WARDEN',
  };
  const classColorMap: Record<string, string> = {
    'VANGUARD': 'blue.400',      // Steel Blue
    'SHADOWBLADE': 'purple.400', // Deep Purple
    'AETHER_WEAVER': 'cyan.300', // Electric Blue
    'DAWNKEEPER': 'yellow.300',  // Gold
    'TECHNOMANCER': 'teal.300',  // Cyan/Teal
    'GLOOM_WARDEN': 'green.400', // Forest Green
    'Unknown': 'gray.200',       // Default
  };
  const getPlayerClass = (name: string) => playerClassMap[name] || 'Unknown';
  const getPlayerColor = (name: string) => classColorMap[getPlayerClass(name)];
  const getMobColor = (hostility: Hostility) => {
    switch (hostility) {
      case Hostility.HOSTILE: return 'red.400'; // Red
      case Hostility.FRIENDLY: return 'green.400'; // Green
      default: return 'gray.200'; // White
    }
  };

  const panelBg = 'gray.900';

  return (
    <Box bg={panelBg} borderRadius="lg" boxShadow="md" p={4} minH="180px">
      <Heading as="h2" size="md" mb={2} color="blue.200">{room?.name || 'Connecting to NightfallMUD...'}</Heading>
      <Text mb={2}>{room?.description}</Text>
      {mobsInRoom.length > 0 && (
        <Box mb={2}>
          <Text fontWeight="semibold">Creatures here:</Text>
          <Flex gap={2} wrap="wrap">
            {mobsInRoom.map((mob: Mob) => (
              <Box
                key={mob.id}
                px={3}
                py={1}
                borderRadius="md"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                color={getMobColor(mob.hostility)}
                fontWeight="bold"
                fontSize="1em"
                minW="60px"
                textAlign="center"
                letterSpacing="0.01em"
              >
                {mob.name}
              </Box>
            ))}
          </Flex>
        </Box>
      )}
      {roomItems.length > 0 && (
        <Box mb={2}>
          <Text fontWeight="semibold">You also see:</Text>
          <Flex gap={2} wrap="wrap">
            {roomItems.map((item: Item) => (
              <GameTooltip key={item.id} item={item}>
                <Button
                  size="sm"
                  colorScheme="yellow"
                  variant="outline"
                  onClick={() => handleCommandClick('get', item.baseItem?.name || item.name)}
                >
                  {item.baseItem?.name || item.name}
                </Button>
              </GameTooltip>
            ))}
          </Flex>
        </Box>
      )}
      {playersInRoom.length > 0 && (
        <Box mb={2}>
          <Text fontWeight="semibold">Also here:</Text>
          <Flex gap={2} wrap="wrap">
            {playersInRoom.map((name: string) => (
              <Box
                key={name}
                px={3}
                py={1}
                borderRadius="md"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                color={getPlayerColor(name)}
                fontWeight="bold"
                fontSize="1em"
                minW="60px"
                textAlign="center"
                letterSpacing="0.01em"
              >
                {name}
              </Box>
            ))}
          </Flex>
        </Box>
      )}
      {room && (
        <Box>
          <Text fontWeight="semibold">Exits:</Text>
          <Flex gap={2} wrap="wrap">
            {Object.keys(room.exits).map((direction) => (
              <Button
                key={direction}
                size="sm"
                variant="ghost"
                color="cyan.200"
                fontWeight="bold"
                fontSize="1em"
                _hover={{ bg: 'gray.700', color: 'cyan.100' }}
                onClick={() => handleCommandClick('move', direction)}
              >
                {direction}
              </Button>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
