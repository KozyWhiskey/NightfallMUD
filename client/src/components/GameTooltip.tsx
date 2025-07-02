// client/src/components/Tooltip.tsx
import type { Item } from '../types';
import type { ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface GameTooltipProps {
  item?: Item;
  style?: React.CSSProperties;
  label?: string;
  placement?: string;
  isDisabled?: boolean;
  children: ReactNode;
}

const formatAttributeName = (name: string) => {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export function ItemDetails({ item }: { item: Item }) {
  if (!item) return null;
  const { baseItem, rarity, itemAffixes } = item;
  return (
    <Box width="250px" bg="gray.900" border="1px solid" borderColor="gray.600" borderRadius="md" p="12px" color="gray.100" fontSize="0.9rem" boxShadow="md">
      <Flex justifyContent="space-between" alignItems="center" borderBottom="1px solid" borderColor="gray.700" pb="8px" mb="8px">
        <Text fontWeight="bold" fontSize="1.1em" color="purple.300" textTransform="capitalize">{baseItem.name}</Text>
        <Text fontSize="0.8em" color="gray.400" textTransform="uppercase">{baseItem.slot}</Text>
        <Text fontSize="0.9em" color="purple.300">{rarity}</Text>
      </Flex>
      <Text fontStyle="italic" color="gray.300" mb={2}>{baseItem.description}</Text>
      <Box display="flex" flexDirection="column" gap="4px">
        {baseItem.baseDamage && (
          <Flex justifyContent="space-between"><span>Damage</span><span>{baseItem.baseDamage}</span></Flex>
        )}
        {baseItem.baseArmor && (
          <Flex justifyContent="space-between"><span>Armor</span><span>{baseItem.baseArmor}</span></Flex>
        )}
        {baseItem.baseMagicResist && (
          <Flex justifyContent="space-between"><span>Magic Resist</span><span>{baseItem.baseMagicResist}</span></Flex>
        )}
        {itemAffixes && itemAffixes.map(itemAffix => (
          Object.entries(itemAffix.value).map(([key, value]) => (
            <Flex key={`${itemAffix.id}-${key}`} justifyContent="space-between" color="green.200">
              <span>{itemAffix.affix.name} ({formatAttributeName(key)})</span>
              <span>+{value}</span>
            </Flex>
          ))
        ))}
        <Flex justifyContent="space-between" color="gray.400" mt={1} pt={1} borderTop="1px dashed" borderColor="gray.700">
          <span>Weight</span>
          <span>{baseItem.baseWeight}</span>
        </Flex>
      </Box>
    </Box>
  );
}

export function GameTooltip({ item, style, children, isDisabled }: GameTooltipProps) {
  if (isDisabled || !item) return <>{children}</>;
  return (
    <Box as="span" position="relative" display="inline-block">
      {children}
      <Box
        style={style}
        position="absolute"
        zIndex={100}
        pointerEvents="none"
      >
        <ItemDetails item={item} />
      </Box>
    </Box>
  );
}
