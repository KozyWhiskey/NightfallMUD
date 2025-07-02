// client/src/components/MobCard.tsx
import type { Mob, Player } from '../types';
import { Hostility } from '../types';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

interface MobCardProps {
  mob: Mob;
  player: Player | null;
  onAttack: (mobName: string) => void;
  isActionDisabled: boolean;
}

export function MobCard({ mob, player, onAttack, isActionDisabled }: MobCardProps) {
  const isTargetingPlayer = mob.targetId === player?.id;
  const canAttack = mob.hostility !== Hostility.FRIENDLY;

  return (
    <Box
      bg="gray.800"
      border="1px solid"
      borderColor={isTargetingPlayer ? 'red.400' : 'gray.700'}
      borderRadius="md"
      p="8px"
      w="180px"
      boxShadow={isTargetingPlayer ? '0 0 10px rgba(244, 67, 54, 0.5)' : '0 2px 5px rgba(0,0,0,0.3)'}
      flexShrink={0}
      display="flex"
      flexDirection="column"
      transition="border-color 0.3s"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="6px">
        <Text fontWeight="bold" color="gray.100">{mob.name}</Text>
        <Text fontSize="0.8em" color="gray.400">Lvl {mob.level}</Text>
      </Flex>
      <Box
        bg="gray.900"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.600"
        position="relative"
        h="18px"
        mb="8px"
        boxSizing="border-box"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          h="100%"
          bg="red.700"
          borderRadius="sm"
          transition="width 0.5s ease-in-out"
          w={`${(mob.hp / mob.maxHp) * 100}%`}
        />
        <Text
          position="absolute"
          w="100%"
          h="100%"
          top={0}
          left={0}
          color="white"
          textAlign="center"
          fontSize="0.8em"
          lineHeight="16px"
          fontWeight="bold"
          textShadow="1px 1px 2px rgba(0,0,0,0.7)"
        >
          {mob.hp} / {mob.maxHp}
        </Text>
      </Box>
      <Box mt="auto" pt="6px">
        {canAttack ? (
          <Button
            w="100%"
            colorScheme="purple"
            size="md"
            borderRadius="sm"
            fontWeight="bold"
            _hover={{ filter: 'brightness(1.2)' }}
            _disabled={{ bg: 'gray.700', borderColor: 'gray.600', color: 'gray.400', cursor: 'not-allowed' }}
            onClick={() => onAttack(mob.name)}
            disabled={isActionDisabled}
            transition="background-color 0.2s"
          >
            Attack
          </Button>
        ) : (
          <Text display="block" textAlign="center" fontSize="0.9em" color="green.300" fontWeight="bold">
            Friendly
          </Text>
        )}
      </Box>
    </Box>
  );
}
