// client/src/components/CombatPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { MobCard } from './MobCard';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Hostility } from '../types';

// Animation for the round timer bar
const roundTimerAnimation = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

// This component no longer needs props
export function CombatPanel() {
  // --- THIS IS THE FIX ---
  // Select each piece of state individually to prevent re-renders.
  const mobs = useGameStore(state => state.mobsInRoom);
  const player = useGameStore(state => state.player);
  const sendCommand = useGameStore(state => state.sendCommand);
  const isActionDisabled = useGameStore(state => state.isActionDisabled);
  const roundTimerKey = useGameStore(state => state.roundTimerKey);

  const handleMobAttack = (mobName: string) => {
    sendCommand({ action: 'attack', payload: mobName });
  };

  // Only show if there are hostile mobs
  const hostileMobs = mobs.filter(mob => mob.hostility === Hostility.HOSTILE);
  if (hostileMobs.length === 0) {
    return null;
  }

  return (
    <Box
      flexShrink={0}
      p="18px"
      borderBottom="1px solid"
      borderColor="gray.700"
      bg="gray.800"
      borderRadius="lg"
      border="1px solid"
      position="relative"
      overflow="hidden"
      mb={3}
    >
      <Heading as="h4" size="sm" color="gray.100" mb={3} fontWeight="semibold" letterSpacing="wide">
        Combat
      </Heading>
      <Flex flexWrap="wrap" gap="18px">
        {hostileMobs.map(mob => (
          <MobCard
            key={mob.id}
            mob={mob}
            player={player}
            onAttack={handleMobAttack}
            isActionDisabled={isActionDisabled}
          />
        ))}
      </Flex>
      <Box
        key={roundTimerKey}
        position="absolute"
        bottom={0}
        left={0}
        h="4px"
        w="100%"
        bg="purple.300"
        animation={`${roundTimerAnimation} 3s linear forwards`}
      />
    </Box>
  );
}
