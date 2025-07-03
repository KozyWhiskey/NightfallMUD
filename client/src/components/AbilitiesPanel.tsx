import { Box, Text, VStack, HStack, Button, Badge, Flex } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { useGameStore } from '../stores/useGameStore';
import { HiLightningBolt, HiHeart, HiShieldCheck, HiEye, HiFire } from 'react-icons/hi';

interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  type: 'attack' | 'defense' | 'utility';
  level: number;
  damage?: number;
  healing?: number;
}

const getAbilityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'attack':
      return <HiFire size={14} />;
    case 'defense':
      return <HiShieldCheck size={14} />;
    case 'utility':
      return <HiEye size={14} />;
    default:
      return <HiLightningBolt size={14} />;
  }
};

const getAbilityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'attack':
      return '#f59e0b'; // Amber
    case 'defense':
      return '#3b82f6'; // Blue
    case 'utility':
      return '#8b5cf6'; // Purple
    default:
      return '#6b7280'; // Gray
  }
};

export function AbilitiesPanel() {
  const { player, sendCommand } = useGameStore();

  const handleUseAbility = (abilityName: string) => {
    sendCommand({ action: 'ability', payload: abilityName });
  };

  // Mock abilities - in a real implementation, these would come from the player data
  const mockAbilities: Ability[] = [
    {
      id: '1',
      name: 'Sundering Strike',
      description: 'Channel your desperation into a devastating blow that cleaves through armor.',
      cooldown: 3,
      type: 'attack',
      level: 1,
      damage: 15
    },
    {
      id: '2',
      name: 'Guardian\'s Resolve',
      description: 'Draw upon the last vestiges of hope to bolster your defenses.',
      cooldown: 5,
      type: 'defense',
      level: 2
    },
    {
      id: '3',
      name: 'Survivor\'s Instinct',
      description: 'When death looms, find the strength to fight another moment.',
      cooldown: 8,
      type: 'utility',
      level: 3,
      healing: 25
    },
    {
      id: '4',
      name: 'Gloom Ward',
      description: 'Temporarily shield yourself from the corrupting influence of the darkness.',
      cooldown: 6,
      type: 'defense',
      level: 2
    }
  ];

  return (
    <Box
      p={3}
      maxH="100%"
      h="100%"
      overflowY="auto"
      bg="#1a1a1a"
      __css={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#444 #1a1a1a',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1a1a1a',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#444',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}
    >
      <VStack gap={2} align="stretch">
        <Box mb={2}>
          <Text fontSize="sm" color="#a0a0a0" fontWeight="medium" letterSpacing="0.05em">
            SURVIVOR TECHNIQUES
          </Text>
        </Box>
        
        {mockAbilities.map((ability: Ability) => (
          <Box
            key={ability.id}
            bg="#2a2a2a"
            borderRadius="md"
            p={3}
            border="1px solid"
            borderColor="#444"
            _hover={{ 
              borderColor: getAbilityColor(ability.type),
              bg: '#333',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease'
            }}
            transition="all 0.2s ease"
          >
            <Flex justify="space-between" align="start" mb={2}>
              <HStack gap={2} flex="1">
                <Box 
                  color={getAbilityColor(ability.type)}
                  bg={`${getAbilityColor(ability.type)}20`}
                  p={1}
                  borderRadius="sm"
                >
                  {getAbilityIcon(ability.type)}
                </Box>
                <VStack align="start" gap={0} flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="#e0e0e0">
                    {ability.name}
                  </Text>
                  <Text fontSize="xs" color="#a0a0a0">
                    Level {ability.level} • {ability.type.charAt(0).toUpperCase() + ability.type.slice(1)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                bg={`${getAbilityColor(ability.type)}20`}
                color={getAbilityColor(ability.type)}
                border={`1px solid ${getAbilityColor(ability.type)}40`}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="sm"
              >
                {ability.cooldown}s CD
              </Badge>
            </Flex>
            
            <Text fontSize="xs" color="#c0c0c0" mb={3} lineHeight="1.5" fontStyle="italic">
              {ability.description}
            </Text>
            
            <Flex justify="space-between" align="center">
              <HStack gap={2}>
                {ability.damage && (
                  <Badge 
                    bg="#dc262620" 
                    color="#f87171" 
                    border="1px solid #dc262640"
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    {ability.damage} DMG
                  </Badge>
                )}
                {ability.healing && (
                  <Badge 
                    bg="#05966920" 
                    color="#34d399" 
                    border="1px solid #05966940"
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    {ability.healing} HEAL
                  </Badge>
                )}
              </HStack>
              
              <Button
                size="xs"
                bg={getAbilityColor(ability.type)}
                color="#1a1a1a"
                border="none"
                _hover={{ 
                  bg: `${getAbilityColor(ability.type)}dd`,
                  transform: 'scale(1.05)'
                }}
                onClick={() => handleUseAbility(ability.name)}
                fontWeight="bold"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="sm"
                transition="all 0.2s ease"
              >
                USE
              </Button>
            </Flex>
          </Box>
        ))}
        
        <Box p={3} textAlign="center" bg="#2a2a2a" borderRadius="md" border="1px solid #444">
          <Text color="#a0a0a0" fontSize="xs" fontStyle="italic">
            "In the darkness, we learn to fight with what remains..."
          </Text>
        </Box>
      </VStack>
    </Box>
  );
} 