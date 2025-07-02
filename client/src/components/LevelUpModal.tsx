// client/src/components/LevelUpModal.tsx
import { useState } from 'react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import type { Player } from '../types';

interface LevelUpModalProps {
  player: Player;
  onConfirm: (assignedPoints: Record<string, number>) => void;
  onCancel: () => void;
}

const coreStats: Array<keyof Player> = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export function LevelUpModal({ player, onConfirm, onCancel }: LevelUpModalProps) {
  const [pointsToSpend, setPointsToSpend] = useState(player.unspentStatPoints);
  const [assignedPoints, setAssignedPoints] = useState<Record<string, number>>({});

  const handleIncrement = (stat: keyof Player) => {
    if (pointsToSpend > 0) {
      setPointsToSpend(prev => prev - 1);
      setAssignedPoints(prev => ({
        ...prev,
        [stat]: (prev[stat] || 0) + 1,
      }));
    }
  };

  const handleDecrement = (stat: keyof Player) => {
    if ((assignedPoints[stat] || 0) > 0) {
      setPointsToSpend(prev => prev + 1);
      setAssignedPoints(prev => ({
        ...prev,
        [stat]: prev[stat] - 1,
      }));
    }
  };

  const handleReset = () => {
    setPointsToSpend(player.unspentStatPoints);
    setAssignedPoints({});
  };

  const handleConfirm = () => {
    if (pointsToSpend === 0 && Object.keys(assignedPoints).length > 0) {
      onConfirm(assignedPoints);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.75)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex="1000"
      onClick={onCancel}
    >
      <Box
        bg="gray.800"
        p="30px"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.700"
        w="100%"
        maxW="400px"
        textAlign="center"
        boxShadow="lg"
        onClick={e => e.stopPropagation()}
      >
        <Heading as="h2">You have reached a new level!</Heading>
        <Text>
          You have <strong>{pointsToSpend}</strong> attribute points to spend.
        </Text>
        <Box my="20px">
          {coreStats.map(stat => (
            <Flex
              key={stat}
              justifyContent="space-between"
              alignItems="center"
              py="10px"
              borderBottom="1px solid"
              borderColor="gray.700"
            >
              <Text textTransform="uppercase" fontWeight="bold">
                {stat.toUpperCase()}
              </Text>
              <Text fontSize="1.2em">
                {player[stat] as number + (assignedPoints[stat] || 0)}
              </Text>
              <Flex alignItems="center" gap="10px">
                <Button
                  fontSize="1.2em"
                  fontWeight="bold"
                  p="2px 10px"
                  minW="30px"
                  onClick={() => handleDecrement(stat)}
                  disabled={(assignedPoints[stat] || 0) === 0}
                  opacity={(assignedPoints[stat] || 0) === 0 ? 0.5 : 1}
                  cursor={(assignedPoints[stat] || 0) === 0 ? "not-allowed" : "pointer"}
                >
                  -
                </Button>
                <Button
                  fontSize="1.2em"
                  fontWeight="bold"
                  p="2px 10px"
                  minW="30px"
                  onClick={() => handleIncrement(stat)}
                  disabled={pointsToSpend === 0}
                  opacity={pointsToSpend === 0 ? 0.5 : 1}
                  cursor={pointsToSpend === 0 ? "not-allowed" : "pointer"}
                >
                  +
                </Button>
              </Flex>
            </Flex>
          ))}
        </Box>
        <Flex mt="20px" justifyContent="space-between">
          <Button p="10px 20px" w="48%" onClick={handleReset}>
            Reset
          </Button>
          <Button p="10px 20px" w="48%" onClick={handleConfirm} disabled={pointsToSpend > 0}>
            Confirm
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}