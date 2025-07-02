// client/src/components/AvatarPanel.tsx
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import type { Item } from '../types';
import { EquipSlot } from '../types';
import { Box, Heading, Text, Button, Flex, VStack } from '@chakra-ui/react';
import { MdInfoOutline, MdClose } from 'react-icons/md';
import { GameTooltip, ItemDetails } from './GameTooltip';

const EQUIP_SLOTS = [
  EquipSlot.HEAD, EquipSlot.AMULET, EquipSlot.CHEST, EquipSlot.LEGS, EquipSlot.FEET, EquipSlot.HANDS, 
  EquipSlot.WEAPON_MAIN, EquipSlot.WEAPON_OFF, EquipSlot.RING
] as const;

export function AvatarPanel() {
  const inventory = useGameStore(state => state.inventory);
  const sendCommand = useGameStore(state => state.sendCommand);
  const equippedItems = useMemo(() => inventory.filter(item => item.equipped), [inventory]);
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const itemMap = useMemo(() => new Map(equippedItems.map(item => [item.baseItem.slot, item])), [equippedItems]);

  const handleSlotClick = (slot: string, hasItem: boolean) => {
    if (!hasItem) return;
    setSelectedSlot(prev => (prev === slot ? null : slot));
  };

  const handleItemAction = (action: string, itemName: string) => {
    sendCommand({ action: action.toLowerCase(), payload: itemName.toLowerCase() });
  };

  const formatSlotName = (slot: string) => {
    return slot.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box bg="gray.800" borderRadius="lg" border="1px solid" borderColor="gray.700" p="4" minH="200px">
      <Heading as="h4" size="md" mb="4" color="gray.100" fontSize="1em" fontWeight="medium">
        Equipped Items
      </Heading>
      <VStack gap="2" alignItems="stretch">
        {EQUIP_SLOTS.map(slot => {
          const item = itemMap.get(slot);
          const isSelected = selectedSlot === slot;
          
          return (
            <Box
              key={slot}
              bg={isSelected ? "gray.700" : "gray.900"}
              borderRadius="md"
              p="3"
              border="1px solid"
              borderColor={isSelected ? "gray.600" : "gray.700"}
              cursor={item ? 'pointer' : 'default'}
              _hover={item ? { bg: "gray.700", borderColor: "gray.600" } : {}}
              onClick={() => handleSlotClick(slot, !!item)}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="center" w="100%">
                {/* Slot name - 28% width, right-aligned, allow wrap */}
                <Box w="28%" textAlign="right" pr="3">
                  <Text 
                    fontSize="0.85em" 
                    color="gray.400" 
                    fontWeight="medium"
                    textTransform="capitalize"
                  >
                    {formatSlotName(slot)}
                  </Text>
                </Box>
                {/* Item name - 72% width, left-aligned, allow wrap */}
                <Box w="72%" pl="3">
                  <Text
                    as="span"
                    fontSize="0.85em"
                    color={item ? "gray.100" : "gray.500"}
                    fontWeight="medium"
                    textAlign="left"
                    cursor={item ? 'pointer' : 'default'}
                    onMouseEnter={item ? (e => {
                      setHoveredItem(item);
                      setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                    }) : undefined}
                    onMouseMove={item ? (e => {
                      setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                    }) : undefined}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item ? item.baseItem.name : 'Empty'}
                  </Text>
                </Box>
              </Flex>
              {/* Action buttons when selected */}
              {isSelected && item && (
                <Flex gap="2" mt="3" justify="flex-end">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={e => { e.stopPropagation(); handleItemAction('examine', item.baseItem.name); }}
                    fontSize="0.8em"
                    px="2"
                    py="1"
                  >
                    <MdInfoOutline />
                    Examine
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={e => { e.stopPropagation(); handleItemAction('unequip', item.baseItem.name); }}
                    fontSize="0.8em"
                    px="2"
                    py="1"
                  >
                    <MdClose />
                    Unequip
                  </Button>
                </Flex>
              )}
            </Box>
          );
        })}
      </VStack>
      {/* Tooltip rendered absolutely, only when hovering over item name */}
      {hoveredItem && (
        <Box
          position="fixed"
          left={tooltipPos.x}
          top={tooltipPos.y}
          zIndex={2000}
          pointerEvents="none"
        >
          <ItemDetails item={hoveredItem} />
        </Box>
      )}
    </Box>
  );
}
