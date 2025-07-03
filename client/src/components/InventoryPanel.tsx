// client/src/components/InventoryPanel.tsx
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import type { Item } from '../types';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { css } from '@emotion/react';
import { MdInfoOutline, MdDelete, MdCheck } from 'react-icons/md';
import { GameTooltip, ItemDetails } from './GameTooltip';

export function InventoryPanel() {
  const inventory = useGameStore(state => state.inventory);
  const sendCommand = useGameStore(state => state.sendCommand);
  const backpackItems = useMemo(() => inventory.filter(item => !item.equipped), [inventory]);

  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleItemAction = (action: string, itemName: string) => {
    sendCommand({ action: action.toLowerCase(), payload: itemName.toLowerCase() });
  };

  const formatSlotName = (slot: string) => {
    if (!slot || slot === 'NONE') return 'Misc';
    return slot.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box bg="gray.800" borderRadius="lg" border="1px solid" borderColor="gray.700" p="4" minH="200px">
      <Heading as="h4" size="md" mb="4" color="gray.100" fontSize="1em" fontWeight="medium">
        Backpack
      </Heading>
      <Box
        maxH="calc(100vh - 200px)"
        overflowY="auto"
        __css={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#444 #2a2a2a',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2a2a2a',
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
        <VStack gap="2" alignItems="stretch">
          {backpackItems.length === 0 ? (
            <Text color="gray.400" fontStyle="italic" fontSize="sm">Your backpack is empty.</Text>
          ) : (
            backpackItems.map(item => (
              <Box
                key={item.id}
                bg="gray.900"
                borderRadius="md"
                p="3"
                border="1px solid"
                borderColor="gray.700"
                _hover={{ bg: "gray.700", borderColor: "gray.600" }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center" w="100%">
                  {/* Slot/type - 28% width, right-aligned, allow wrap */}
                  <Box w="28%" textAlign="right" pr="3">
                    <Text
                      fontSize="0.85em"
                      color="gray.400"
                      fontWeight="medium"
                      textTransform="capitalize"
                    >
                      {formatSlotName(item.baseItem.slot)}
                    </Text>
                  </Box>
                  {/* Item name - 72% width, left-aligned, allow wrap, tooltip only on hover */}
                  <Box w="72%" pl="3">
                    <Text
                      as="span"
                      fontSize="0.85em"
                      color="gray.100"
                      fontWeight="medium"
                      textAlign="left"
                      cursor="pointer"
                      onMouseEnter={e => {
                        setHoveredItem(item);
                        setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                      }}
                      onMouseMove={e => {
                        setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {item.baseItem.name}
                    </Text>
                  </Box>
                  {/* Action buttons */}
                  <Flex direction="row" gap={1} ml={2}>
                    <IconButton
                      aria-label="Examine"
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        setHoveredItem(item);
                        setTooltipPos({ x: e.clientX + 16, y: e.clientY - 24 });
                      }}
                    >
                      <MdInfoOutline />
                    </IconButton>
                    {item.baseItem.slot !== 'NONE' && (
                      <IconButton
                        aria-label="Equip"
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); handleItemAction('equip', item.baseItem.name); }}
                      >
                        <MdCheck />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="Drop"
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={e => { e.stopPropagation(); handleItemAction('drop', item.baseItem.name); }}
                    >
                      <MdDelete />
                    </IconButton>
                  </Flex>
                </Flex>
              </Box>
            ))
          )}
        </VStack>
      </Box>
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
