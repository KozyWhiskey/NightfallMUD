// client/src/components/AvatarPanel.tsx
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import type { Item } from '../types';
import { Tooltip } from './Tooltip';
import './AvatarPanel.css';

const EQUIP_SLOTS = [
  'HEAD', 'AMULET', 'CHEST', 'LEGS', 'FEET', 'HANDS', 
  'WEAPON_MAIN', 'WEAPON_OFF', 'RING'
] as const;

export function AvatarPanel() {
  const inventory = useGameStore(state => state.inventory);
  const sendCommand = useGameStore(state => state.sendCommand);
  const equippedItems = useMemo(() => inventory.filter(item => item.equipped), [inventory]);
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const itemMap = useMemo(() => new Map(equippedItems.map(item => [item.template.slot, item])), [equippedItems]);

  const handleSlotClick = (slot: string, hasItem: boolean) => {
    if (!hasItem) return;
    setSelectedSlot(prev => (prev === slot ? null : slot));
  };

  const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
    setHoveredItem(item);
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleItemAction = (action: string, itemName: string) => {
    sendCommand({ action: action.toLowerCase(), payload: itemName.toLowerCase() });
  };

  return (
    <>
      {hoveredItem && <Tooltip item={hoveredItem} style={{ top: tooltipPosition.y, left: tooltipPosition.x }} />}
      <div className="avatar-panel">
        <h4>Equipped</h4>
        <div className="slot-grid">
          {EQUIP_SLOTS.map(slot => {
            const item = itemMap.get(slot);
            return (
              <div 
                key={slot} 
                className="equip-slot-container"
                onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
                onMouseLeave={item ? handleMouseLeave : undefined}
              >
                <div
                  className={`equip-slot ${item ? 'has-item' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => handleSlotClick(slot, !!item)}
                >
                  <div className="slot-label">{slot.replace('_', ' ').toLowerCase()}</div>
                  <div className="slot-item-name">
                    {item ? item.template.name : '----'}
                  </div>
                </div>

                {selectedSlot === slot && item && (
                  <div className="item-actions">
                    <button onClick={() => handleItemAction('examine', item.template.name)}>Details</button>
                    <button onClick={() => handleItemAction('unequip', item.template.name)}>Unequip</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
