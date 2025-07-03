// client/src/components/RoomInfoPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { Hostility } from '../types';
import type { Mob, Item } from '../types';
import { Box, Heading, Text, Button, Group, Flex, Icon } from '@chakra-ui/react';
import { GameTooltip } from './GameTooltip';
import { useState } from 'react';
import { GiBroadsword, GiPotionBall, GiScrollUnfurled, GiShield } from 'react-icons/gi';

export function RoomInfoPanel() {
  const room = useGameStore(state => state.room);
  const mobsInRoom = useGameStore(state => state.mobsInRoom);
  const roomItems = useGameStore(state => state.roomItems);
  const playersInRoom = useGameStore(state => state.playersInRoom);
  const sendCommand = useGameStore(state => state.sendCommand);

  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Rarity color map
  const rarityColor: Record<string, string> = {
    common: 'gray.400',
    uncommon: 'green.300',
    rare: 'pale.200',
    epic: '#ffd700',
    legendary: 'purple.300',
  };
  // Item type icon map
  const itemIcon: Record<string, any> = {
    WEAPON_MAIN: GiBroadsword,
    POTION: GiPotionBall,
    SCROLL: GiScrollUnfurled,
    ARMOR: GiShield,
  };

  return (
    <Box bg={panelBg} borderRadius="lg" boxShadow="md" p={4} minH="180px">
      {/* Room Name & Description */}
      <Heading
        as="h2"
        fontFamily="Merriweather, Georgia, serif"
        color="pale.200"
        fontSize="2xl"
        textShadow="0 0 8px #b6e0fe88"
        mb={1}
      >
        {room?.name || 'Connecting to NightfallMUD...'}
      </Heading>
      <Text
        fontStyle="italic"
        color="gray.400"
        borderLeft="3px solid"
        borderColor="#3a4a4a"
        pl={3}
        mb={3}
      >
        {room?.description}
      </Text>
      {/* Creatures */}
      {mobsInRoom.length > 0 && (
        <Box mb={2}>
          <Text fontWeight="semibold">Creatures here:</Text>
          <Flex gap={2} wrap="wrap">
            {mobsInRoom.map((mob: Mob) => (
              <Flex
                key={mob.id}
                px={3}
                py={1}
                borderRadius="full"
                border="2px solid"
                borderColor={getMobColor(mob.hostility)}
                bg="gray.800"
                color={getMobColor(mob.hostility)}
                fontWeight="bold"
                fontSize="sm"
                alignItems="center"
                gap={2}
                boxShadow={mob.hostility === Hostility.HOSTILE ? '0 0 8px #7f1d1d55' : undefined}
              >
                {/* Optional: mob icon could go here */}
                <Text>{mob.name}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
      {/* Items in Room */}
      {roomItems.length > 0 && (
        <Box mb={2} position="relative">
          <Text fontWeight="semibold">You also see:</Text>
          <Flex gap={2} wrap="wrap">
            {roomItems.map((item: Item) => {
              const rarity = (item.rarity || 'common').toLowerCase();
              const color = rarityColor[rarity] || 'gray.400';
              const icon = itemIcon[item.baseItem?.slot] || GiBroadsword;
              return (
                <Box
                  key={item.id}
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  bg="gray.900"
                  border="1.5px solid"
                  borderColor={color}
                  borderRadius="md"
                  p={2}
                  minW="120px"
                  boxShadow={rarity === 'legendary' ? '0 0 8px 2px #bb86fc55' : 'md'}
                  _hover={{ boxShadow: '0 0 12px 2px #b6e0fe55' }}
                  cursor="pointer"
                  position="relative"
                  onMouseEnter={e => {
                    setHoveredItem(item);
                    setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                  }}
                  onMouseMove={e => {
                    setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleCommandClick('get', item.baseItem?.name || item.name)}
                >
                  <Icon as={icon} color={color} boxSize={5} mr={2} />
                  <Box>
                    <Text fontWeight="bold" color={color}>{item.baseItem?.name || item.name}</Text>
                    <Text fontSize="xs" color="gray.400" fontStyle="italic" truncate>{item.baseItem?.description}</Text>
                  </Box>
                </Box>
              );
            })}
          </Flex>
          {hoveredItem && (
            <Box
              position="fixed"
              left={tooltipPos.x}
              top={tooltipPos.y}
              zIndex={2000}
              pointerEvents="none"
            >
              <GameTooltip item={hoveredItem}>{null}</GameTooltip>
            </Box>
          )}
        </Box>
      )}
      {/* Players in Room */}
      {playersInRoom.length > 0 && (
        <Box mb={2}>
          <Text fontWeight="semibold">Also here:</Text>
          <Flex gap={2} wrap="wrap">
            {playersInRoom.map((name: string) => (
              <Flex
                key={name}
                px={3}
                py={1}
                borderRadius="full"
                border="2px solid"
                borderColor={getPlayerColor(name)}
                bg="gray.800"
                color={getPlayerColor(name)}
                fontWeight="bold"
                fontSize="sm"
                alignItems="center"
                gap={2}
              >
                {/* Optional: class icon could go here */}
                <Text>{name}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
      {/* Exits */}
      {room && (
        <Box>
          <Text fontWeight="semibold">Exits:</Text>
          <Flex gap={3} mt={2} wrap="wrap">
            {[...Object.keys(room.exits)].sort((a, b) => {
              // Custom sort: 'west' first, then 'east', then others alphabetically
              if (a === 'west') return -1;
              if (b === 'west') return 1;
              if (a === 'east') return b === 'west' ? 1 : -1;
              if (b === 'east') return a === 'west' ? -1 : 1;
              return a.localeCompare(b);
            }).map((direction) => (
              <Box
                key={direction}
                px={4}
                py={1}
                borderRadius="full"
                bg="pale.200"
                color="#18181b"
                fontWeight="bold"
                boxShadow="0 0 8px #b6e0fe55"
                _hover={{ bg: 'pale.100', boxShadow: '0 0 12px #b6e0fe99' }}
                cursor="pointer"
                onClick={() => handleCommandClick('move', direction)}
              >
                {direction}
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
