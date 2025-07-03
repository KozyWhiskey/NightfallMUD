import { Box, Text, VStack, HStack, Button, Badge, Flex, Tooltip } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { useGameStore } from '../stores/useGameStore';
import { HiSparkles, HiLightningBolt, HiFire, HiHeart, HiEye } from 'react-icons/hi';

interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  school: string;
  level: number;
  damage?: number;
  healing?: number;
}

const getSpellIcon = (school: string) => {
  switch (school.toLowerCase()) {
    case 'fire':
      return <HiFire size={14} />;
    case 'lightning':
      return <HiLightningBolt size={14} />;
    case 'healing':
      return <HiHeart size={14} />;
    case 'gloom':
      return <HiEye size={14} />;
    default:
      return <HiSparkles size={14} />;
  }
};

const getSpellColor = (school: string) => {
  switch (school.toLowerCase()) {
    case 'fire':
      return '#f59e0b'; // Amber
    case 'lightning':
      return '#eab308'; // Gold
    case 'healing':
      return '#10b981'; // Emerald
    case 'gloom':
      return '#8b5cf6'; // Purple
    default:
      return '#3b82f6'; // Blue
  }
};

export function SpellbookPanel() {
  const { player, sendCommand } = useGameStore();

  const handleCastSpell = (spellName: string) => {
    sendCommand({ action: 'cast', payload: spellName });
  };

  // Mock spells - in a real implementation, these would come from the player data
  const mockSpells: Spell[] = [
    {
      id: '1',
      name: 'Ember Strike',
      description: 'Channel the last warmth of Solas into a devastating fire attack.',
      manaCost: 15,
      school: 'fire',
      level: 1,
      damage: 20
    },
    {
      id: '2',
      name: 'Aether Mend',
      description: 'Weave the remnants of Umbra\'s energy to restore vitality.',
      manaCost: 20,
      school: 'healing',
      level: 1,
      healing: 25
    },
    {
      id: '3',
      name: 'Storm Call',
      description: 'Summon the fury of the eternal storm that rages above.',
      manaCost: 25,
      school: 'lightning',
      level: 2,
      damage: 30
    },
    {
      id: '4',
      name: 'Gloom Sight',
      description: 'Peer through the darkness to reveal hidden threats.',
      manaCost: 10,
      school: 'gloom',
      level: 1
    }
  ];

  if (!player) {
    return (
      <Box p={4} textAlign="center" bg="#1a1a1a" borderRadius="md">
        <Text color="#a0a0a0" fontSize="sm">
          Studying ancient tomes...
        </Text>
      </Box>
    );
  }

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
            SPELLS OF THE FALLEN
          </Text>
        </Box>
        
        {mockSpells.map((spell: Spell) => (
          <Box
            key={spell.id}
            bg="#2a2a2a"
            borderRadius="md"
            p={3}
            border="1px solid"
            borderColor="#444"
            _hover={{ 
              borderColor: getSpellColor(spell.school),
              bg: '#333',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease'
            }}
            transition="all 0.2s ease"
          >
            <Flex justify="space-between" align="start" mb={2}>
              <HStack gap={2} flex="1">
                <Box 
                  color={getSpellColor(spell.school)}
                  bg={`${getSpellColor(spell.school)}20`}
                  p={1}
                  borderRadius="sm"
                >
                  {getSpellIcon(spell.school)}
                </Box>
                <VStack align="start" gap={0} flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="#e0e0e0">
                    {spell.name}
                  </Text>
                  <Text fontSize="xs" color="#a0a0a0">
                    Level {spell.level} • {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                bg={`${getSpellColor(spell.school)}20`}
                color={getSpellColor(spell.school)}
                border={`1px solid ${getSpellColor(spell.school)}40`}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="sm"
              >
                {spell.manaCost} MP
              </Badge>
            </Flex>
            
            <Text fontSize="xs" color="#c0c0c0" mb={3} lineHeight="1.5" fontStyle="italic">
              {spell.description}
            </Text>
            
            <Flex justify="space-between" align="center">
              <HStack gap={2}>
                {spell.damage && (
                  <Badge 
                    bg="#dc262620" 
                    color="#f87171" 
                    border="1px solid #dc262640"
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    {spell.damage} DMG
                  </Badge>
                )}
                {spell.healing && (
                  <Badge 
                    bg="#05966920" 
                    color="#34d399" 
                    border="1px solid #05966940"
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    {spell.healing} HEAL
                  </Badge>
                )}
              </HStack>
              
              <Button
                size="xs"
                bg={getSpellColor(spell.school)}
                color="#1a1a1a"
                border="none"
                _hover={{ 
                  bg: `${getSpellColor(spell.school)}dd`,
                  transform: 'scale(1.05)'
                }}
                _disabled={{
                  bg: '#444',
                  color: '#666',
                  cursor: 'not-allowed'
                }}
                onClick={() => handleCastSpell(spell.name)}
                disabled={player.mana < spell.manaCost}
                fontWeight="bold"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="sm"
                transition="all 0.2s ease"
              >
                CAST
              </Button>
            </Flex>
          </Box>
        ))}
        
        <Box p={3} textAlign="center" bg="#2a2a2a" borderRadius="md" border="1px solid #444">
          <Text color="#a0a0a0" fontSize="xs" fontStyle="italic">
            "In the darkness, knowledge is our only light..."
          </Text>
        </Box>
      </VStack>
    </Box>
  );
} 