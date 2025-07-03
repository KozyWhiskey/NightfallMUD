import { Box, Text, Button, Badge, Grid, GridItem, IconButton, Menu, HStack, VStack, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { HiSparkles, HiLightningBolt, HiFire, HiHeart, HiPencil, HiCheck } from 'react-icons/hi';
import { useGameStore } from '../stores/useGameStore';

interface QuickbarSlot {
  id: string;
  name: string;
  type: 'spell' | 'ability';
  school?: string;
  hotkey: string;
  cooldown?: number;
  manaCost?: number;
}

// Mock data for available spells and abilities
const availableSpells: QuickbarSlot[] = [
  { id: '1', name: 'Fireball', type: 'spell', school: 'fire', hotkey: '', manaCost: 15 },
  { id: '2', name: 'Heal', type: 'spell', school: 'healing', hotkey: '', manaCost: 20 },
  { id: '3', name: 'Lightning Bolt', type: 'spell', school: 'lightning', hotkey: '', manaCost: 25 },
];
const availableAbilities: QuickbarSlot[] = [
  { id: '4', name: 'Power Strike', type: 'ability', hotkey: '', cooldown: 3 },
  { id: '5', name: 'Defensive Stance', type: 'ability', hotkey: '', cooldown: 5 },
  { id: '6', name: 'Second Wind', type: 'ability', hotkey: '', cooldown: 8 },
];
const allOptions = [...availableSpells, ...availableAbilities];

const defaultSlots: QuickbarSlot[] = [
  { ...availableSpells[0], hotkey: '1' },
  { ...availableSpells[1], hotkey: '2' },
  { ...availableAbilities[0], hotkey: '3' },
  { ...availableSpells[2], hotkey: '4' },
  { ...availableAbilities[1], hotkey: '5' },
  { ...availableAbilities[2], hotkey: '6' },
];

export function Quickbar() {
  const { player, sendCommand } = useGameStore();
  const [slots, setSlots] = useState<QuickbarSlot[]>(defaultSlots);
  const [editMode, setEditMode] = useState(false);
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);

  const getSlotIcon = (slot: QuickbarSlot) => {
    if (slot.type === 'spell' && slot.school) {
      switch (slot.school.toLowerCase()) {
        case 'fire': return <HiFire size={20} />;
        case 'lightning': return <HiLightningBolt size={20} />;
        case 'healing': return <HiHeart size={20} />;
        default: return <HiSparkles size={20} />;
      }
    }
    return <HiLightningBolt size={20} />;
  };

  const getSlotColor = (slot: QuickbarSlot) => {
    if (slot.type === 'spell' && slot.school) {
      switch (slot.school.toLowerCase()) {
        case 'fire': return 'red';
        case 'lightning': return 'yellow';
        case 'healing': return 'green';
        default: return 'blue';
      }
    }
    return 'purple';
  };

  const handleSlotClick = (slot: QuickbarSlot) => {
    if (editMode) return;
    if (slot.type === 'spell') {
      sendCommand({ action: 'cast', payload: slot.name });
    } else {
      sendCommand({ action: 'ability', payload: slot.name });
    }
  };

  const isSlotDisabled = (slot: QuickbarSlot) => {
    if (slot.type === 'spell' && slot.manaCost) {
      return player ? player.mana < slot.manaCost : true;
    }
    return false;
  };

  const handleSelectOption = (option: QuickbarSlot, idx: number) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...option, hotkey: (idx + 1).toString() };
    setSlots(newSlots);
    setMenuOpenIdx(null);
  };

  return (
    <Box bg="#2a2a2a" borderRadius="lg" border="1px solid #444" p="16px" mb="8px" position="relative">
      <Flex justify="space-between" align="center" mb="8px" position="relative">
        <Text fontSize="sm" fontWeight="medium" color="#e0e0e0">
          Quickbar
        </Text>
        {editMode ? (
          <Button size="xs" onClick={() => { setEditMode(false); setMenuOpenIdx(null); }} colorScheme="green" variant="outline" px={3}>
            <HiCheck style={{ marginRight: 4 }} />Done
          </Button>
        ) : (
          <IconButton aria-label="Edit quickbar" size="xs" onClick={() => setEditMode(true)} borderRadius="full" bg="#444" color="#e0e0e0" _hover={{ bg: '#666' }} position="absolute" top="-10px" right="-10px" zIndex={3}>
            <HiPencil />
          </IconButton>
        )}
      </Flex>
      <Box w="100%" display="flex" justifyContent="center">
        <Grid templateColumns="repeat(3, 1fr)" templateRows="repeat(2, 1fr)" gap="14px" maxW="340px" w="100%" mx="auto" alignItems="center" justifyItems="center">
          {slots.map((slot, idx) => (
            <GridItem key={idx} w="100%">
              {editMode ? (
                <Menu.Root open={menuOpenIdx === idx} onOpenChange={v => setMenuOpenIdx(v ? idx : null)}>
                  <Menu.Trigger>
                    <Button w="100%" maxW="100px" h="54px" bg="#1a1a1a" borderRadius="8px" border="2px solid #bb86fc" color="#e0e0e0" p={0} _hover={{ bg: '#222' }}>
                      <VStack gap={1} justify="center" align="center" h="100%">
                        <Box color={`${getSlotColor(slot)}.400`} mb="2px">
                          {getSlotIcon(slot)}
                        </Box>
                        <Text fontSize="xs" fontWeight="medium" color="#e0e0e0" truncate maxW="64px">
                          {slot.name}
                        </Text>
                        {slot.manaCost && (
                          <Box
                            position="absolute"
                            bottom="-8px"
                            right="-8px"
                            bg="#e0e0e0"
                            color="#003366"
                            px="7px"
                            py="2px"
                            borderRadius="6px"
                            fontSize="11px"
                            fontWeight="bold"
                            boxShadow="md"
                            border="1px solid #bbb"
                            zIndex={2}
                            minW="28px"
                            textAlign="center"
                          >
                            {slot.manaCost}
                          </Box>
                        )}
                      </VStack>
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content bg="#222" borderColor="#444" color="#e0e0e0" zIndex={10}>
                    {allOptions.map((option) => (
                      <Menu.Item key={option.id} value={option.id} onClick={() => handleSelectOption(option, idx)} bg="#222" _hover={{ bg: '#333' }}>
                        <HStack gap={2}>
                          <Box>{getSlotIcon(option)}</Box>
                          <Text>{option.name}</Text>
                          <Text fontSize="xs" color="#a0a0a0">{option.type === 'spell' ? 'Spell' : 'Ability'}</Text>
                        </HStack>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Root>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme={getSlotColor(slot)}
                  onClick={() => handleSlotClick(slot)}
                  disabled={isSlotDisabled(slot)}
                  w="100%"
                  maxW="100px"
                  h="54px"
                  flexDirection="column"
                  gap={1}
                  bg="#1a1a1a"
                  borderRadius="8px"
                  border="1px solid #444"
                  _hover={{ bg: '#222' }}
                  p="0"
                >
                  <Box color={`${getSlotColor(slot)}.400`} mb="2px">
                    {getSlotIcon(slot)}
                  </Box>
                  <Text fontSize="xs" fontWeight="medium" color="#e0e0e0" truncate maxW="64px">
                    {slot.name}
                  </Text>
                  {slot.manaCost && (
                    <Box
                      position="absolute"
                      bottom="-8px"
                      right="-8px"
                      bg="#e0e0e0"
                      color="#003366"
                      px="7px"
                      py="2px"
                      borderRadius="6px"
                      fontSize="11px"
                      fontWeight="bold"
                      boxShadow="md"
                      border="1px solid #bbb"
                      zIndex={2}
                      minW="28px"
                      textAlign="center"
                    >
                      {slot.manaCost}
                    </Box>
                  )}
                </Button>
              )}
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  );
} 