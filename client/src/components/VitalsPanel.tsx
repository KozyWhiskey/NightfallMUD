// client/src/components/VitalsPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { Box, Text, Flex, Progress } from '@chakra-ui/react';

export function VitalsPanel() {
  const player = useGameStore(state => state.player);

  if (!player) {
    return <Box p={4} bg="gray.900" borderRadius="lg">Loading Vitals...</Box>;
  }

  const panelBg = 'gray.900';

  return (
    <Box className="vitals-panel" bg={panelBg} borderRadius="lg" boxShadow="md" p={4} minH="120px">
      <Flex direction="column" gap={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold" fontSize="lg" color="blue.200">{player.name}</Text>
          <Text color="gray.400">Level {player.level}</Text>
        </Box>
        {/* HP Bar */}
        <Box>
          <Text fontSize="sm" color="red.300">HP</Text>
          <Progress.Root value={(player.hp / player.maxHp) * 100} colorPalette="red" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.300">{player.hp} / {player.maxHp}</Text>
        </Box>
        {/* Mana Bar */}
        <Box>
          <Text fontSize="sm" color="blue.300">MP</Text>
          <Progress.Root value={(player.mana / player.maxMana) * 100} colorPalette="blue" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.300">{player.mana} / {player.maxMana}</Text>
        </Box>
        {/* XP Bar */}
        <Box>
          <Text fontSize="sm" color="yellow.300">XP</Text>
          <Progress.Root value={(player.experience / player.experienceToNextLevel) * 100} colorPalette="yellow" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.300">{player.experience} / {player.experienceToNextLevel}</Text>
        </Box>
      </Flex>
    </Box>
  );
}
