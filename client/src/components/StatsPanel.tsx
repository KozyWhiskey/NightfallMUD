// client/src/components/StatsPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import {
  Box, Heading, Text, Button, Flex, VStack, HStack,
  Accordion
} from '@chakra-ui/react';

interface StatsPanelProps {
  onLevelUpClick: () => void;
}

// Helper for color coding bonuses
const Bonus = ({ value }: { value: number }) => {
  if (value === 0) return null;
  return (
    <Text as="span" ml={1} color={value > 0 ? '#4ade80' : '#f87171'} fontSize="sm">
      {value > 0 ? `+${value}` : value}
    </Text>
  );
};

// Helper for stat display
const StatLine = ({ label, total, base, bonus }: { label: string; total: number; base: number; bonus: number }) => (
  <Flex justify="space-between" align="center" py={0.5} fontSize="sm">
    <Text color="#e0e0e0">{label}</Text>
    <Text color="#e0e0e0">
      <Text as="span" fontSize="md" color="#e0e0e0">{total}</Text>
      <Text as="span" color="#a0a0a0" fontSize="sm" ml={1}>
        ({base}
        <Bonus value={bonus} />
        )
      </Text>
    </Text>
  </Flex>
);

function StatBar({ label, value, max, colorScheme }: { label: string; value: number; max: number; colorScheme: string }) {
  return (
    <Box mb={1}>
      <Text color="#e0e0e0" fontSize="xs" mb={0.5}>{label}</Text>
      <Box position="relative" w="100%" h="12px" bg="gray.800" borderRadius="md">
        <Box
          position="absolute"
          left={0}
          top={0}
          h="100%"
          borderRadius="md"
          bg={colorScheme}
          width={`${Math.max(0, Math.min(100, (value / max) * 100))}%`}
          transition="width 0.3s"
        />
      </Box>
      <Text color="#e0e0e0" fontSize="xs" mt={0.5}>{value} / {max}</Text>
    </Box>
  );
}

export function StatsPanel({ onLevelUpClick }: StatsPanelProps) {
  const player = useGameStore(state => state.player);
  if (!player) return null;

  // Mocked bonus values for demonstration
  const bonuses = {
    strength: 5,
    dexterity: -2,
    constitution: 3,
    intelligence: 0,
    wisdom: 1,
    charisma: 0,
    resolve: 2,
    defense: 4,
    // Derived
    accuracy: 7,
    critChance: 3,
    critDamage: 0,
    spellPower: 10,
    armor: 8,
    evasion: 2,
    block: 0,
    fireRes: 5,
    frostRes: 0,
    gloomRes: 2,
  };

  // Mocked derived stats
  const derived = {
    accuracy: 10 + bonuses.accuracy,
    critChance: 12 + bonuses.critChance,
    critDamage: 50 + bonuses.critDamage,
    spellPower: 45 + bonuses.spellPower,
    armor: 40 + bonuses.armor,
    evasion: 5 + bonuses.evasion,
    block: 0 + bonuses.block,
    fireRes: 20 + bonuses.fireRes,
    frostRes: 10 + bonuses.frostRes,
    gloomRes: 5 + bonuses.gloomRes,
  };

  const readyToLevelUp = player.unspentStatPoints > 0;

  return (
    <Box bg="gray.900" borderRadius="lg" boxShadow="md" p={3} minH="200px" fontSize="sm" h="100%">
      <VStack align="stretch" gap={2}>
        {/* Collapsible Sections - Chakra v3.21.1 API */}
        <Accordion.Root multiple defaultValue={["core"]}>
          {/* Core Attributes */}
          <Accordion.Item value="core" border="none">
            <h2>
              <Accordion.ItemTrigger px={1} py={1} _expanded={{ bg: 'gray.800' }}>
                <Box flex="1" textAlign="left" color="blue.200" fontWeight="medium">Core Attributes</Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent px={1} py={1}>
              <VStack align="stretch" gap={1}>
                <StatLine label="Strength" total={player.strength + bonuses.strength} base={player.strength} bonus={bonuses.strength} />
                <StatLine label="Dexterity" total={player.dexterity + bonuses.dexterity} base={player.dexterity} bonus={bonuses.dexterity} />
                <StatLine label="Constitution" total={player.constitution + bonuses.constitution} base={player.constitution} bonus={bonuses.constitution} />
                <StatLine label="Intelligence" total={player.intelligence + bonuses.intelligence} base={player.intelligence} bonus={bonuses.intelligence} />
                <StatLine label="Wisdom" total={player.wisdom + bonuses.wisdom} base={player.wisdom} bonus={bonuses.wisdom} />
                <StatLine label="Charisma" total={player.charisma + bonuses.charisma} base={player.charisma} bonus={bonuses.charisma} />
                <StatLine label="Resolve" total={player.resolve + bonuses.resolve} base={player.resolve} bonus={bonuses.resolve} />
              </VStack>
            </Accordion.ItemContent>
          </Accordion.Item>
          {/* Offensive Stats */}
          <Accordion.Item value="offensive" border="none">
            <h2>
              <Accordion.ItemTrigger px={1} py={1} _expanded={{ bg: 'gray.800' }}>
                <Box flex="1" textAlign="left" color="yellow.200" fontWeight="medium">Offensive Stats</Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent px={1} py={1}>
              <VStack align="stretch" gap={1}>
                <StatLine label="Accuracy" total={derived.accuracy} base={10} bonus={bonuses.accuracy} />
                <StatLine label="Critical Hit Chance" total={derived.critChance} base={12} bonus={bonuses.critChance} />
                <StatLine label="Critical Hit Damage" total={derived.critDamage} base={50} bonus={bonuses.critDamage} />
                <StatLine label="Spell Power" total={derived.spellPower} base={45} bonus={bonuses.spellPower} />
              </VStack>
            </Accordion.ItemContent>
          </Accordion.Item>
          {/* Defensive Stats */}
          <Accordion.Item value="defensive" border="none">
            <h2>
              <Accordion.ItemTrigger px={1} py={1} _expanded={{ bg: 'gray.800' }}>
                <Box flex="1" textAlign="left" color="green.200" fontWeight="medium">Defensive Stats</Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent px={1} py={1}>
              <VStack align="stretch" gap={1}>
                <StatLine label="Defense" total={player.defense + bonuses.defense} base={player.defense} bonus={bonuses.defense} />
                <StatLine label="Armor" total={derived.armor} base={40} bonus={bonuses.armor} />
                <StatLine label="Evasion" total={derived.evasion} base={5} bonus={bonuses.evasion} />
                <StatLine label="Block" total={derived.block} base={0} bonus={bonuses.block} />
                <StatLine label="Fire Resistance" total={derived.fireRes} base={20} bonus={bonuses.fireRes} />
                <StatLine label="Frost Resistance" total={derived.frostRes} base={10} bonus={bonuses.frostRes} />
                <StatLine label="Gloom Resistance" total={derived.gloomRes} base={5} bonus={bonuses.gloomRes} />
              </VStack>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
        {/* Level Up Button */}
        {readyToLevelUp && (
          <Button colorScheme="yellow" onClick={onLevelUpClick} alignSelf="flex-start" size="sm" mt={2}>
            Level Up! ({player.unspentStatPoints} points available)
          </Button>
        )}
        {/* Gold */}
        <Box mt={1}>
          <Text color="yellow.200" fontSize="sm">Gold: {player.gold}</Text>
        </Box>
      </VStack>
    </Box>
  );
}
