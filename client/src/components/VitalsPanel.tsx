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
    <Box className="vitals-panel" bg={panelBg} borderRadius="lg" boxShadow="md" p={3} minH="80px">
      <Flex direction="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold" fontSize="lg" color="blue.200">{player.name}</Text>
          <Text color="gray.400">Level {player.level}</Text>
        </Box>
        {/* Health Bar */}
        <Box>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="red.300">Health</Text>
            <Text fontSize="xs" color="gray.300">{player.hp} / {player.maxHp}</Text>
          </Flex>
          <Progress.Root value={(player.hp / player.maxHp) * 100} colorPalette="red" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
        {/* Mana Bar */}
        <Box>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="blue.300">Mana</Text>
            <Text fontSize="xs" color="gray.300">{player.mana} / {player.maxMana}</Text>
          </Flex>
          <Progress.Root value={(player.mana / player.maxMana) * 100} colorPalette="blue" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
        {/* Resolve Bar */}
        <Box>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="green.300">Resolve</Text>
            <Text fontSize="xs" color="gray.300">{player.resolve} / 100</Text>
          </Flex>
          <Progress.Root value={(player.resolve / 100) * 100} colorPalette="green" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
        {/* Experience Bar */}
        <Box>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="yellow.300">Experience</Text>
            <Text fontSize="xs" color="gray.300">{player.experience} / {player.experienceToNextLevel}</Text>
          </Flex>
          <Progress.Root value={(player.experience / player.experienceToNextLevel) * 100} colorPalette="yellow" size="sm" borderRadius="md">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      </Flex>
    </Box>
  );
}
