// client/src/components/StatsPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';

interface StatsPanelProps {
  onLevelUpClick: () => void;
}

export function StatsPanel({ onLevelUpClick }: StatsPanelProps) {
  // It still gets the player data from the store
  const player = useGameStore(state => state.player);

  if (!player) {
    // Return null or a minimal loader if there's no player data yet
    return null;
  }

  const readyToLevelUp = player.unspentStatPoints > 0;
  const panelBg = 'gray.900';

  return (
    <Box bg={panelBg} borderRadius="lg" boxShadow="md" p={4} minH="200px">
      <Flex direction="column" gap={3}>
        {readyToLevelUp && (
          <Button colorScheme="yellow" onClick={onLevelUpClick} alignSelf="flex-start">
            Level Up! ({player.unspentStatPoints} points available)
          </Button>
        )}
        <Box>
          <Heading as="h4" size="sm" mb={2} color="blue.200">Attributes</Heading>
          <Text>STR: {player.strength}</Text>
          <Text>DEX: {player.dexterity}</Text>
          <Text>CON: {player.constitution}</Text>
          <Text>INT: {player.intelligence}</Text>
          <Text>WIS: {player.wisdom}</Text>
          <Text>CHA: {player.charisma}</Text>
          <Text>DEF: {player.defense}</Text>
          <Text>RES: {player.resolve}</Text>
        </Box>
        <Box>
          <Text color="yellow.200">Gold: {player.gold}</Text>
        </Box>
      </Flex>
    </Box>
  );
}
