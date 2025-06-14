// client/src/components/AvatarPanel.tsx
import { useState } from 'react';
import type { Item } from '../types';
import { Tooltip } from './Tooltip'; // <-- Import Tooltip
import './AvatarPanel.css';

// Define the order and labels for our equipment slots
const EQUIP_SLOTS = [
  'HEAD', 'AMULET', 'CHEST', 'LEGS', 'FEET', 'HANDS', 
  'WEAPON_MAIN', 'WEAPON_OFF', 'RING'
] as const;

interface AvatarPanelProps {
  equippedItems: Item[];
  onItemAction: (action: string, itemName: string) => void;
}

export function AvatarPanel({ equippedItems, onItemAction }: AvatarPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  // --- NEW: State for handling the tooltip ---
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const itemMap = new Map(equippedItems.map(item => [item.slot, item]));

  const handleSlotClick = (slot: string, hasItem: boolean) => {
    if (!hasItem) return;
    setSelectedSlot(prev => (prev === slot ? null : slot));
  };

  // --- NEW: Handlers for mouse events to show/hide tooltip ---
  const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
    setHoveredItem(item);
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {/* Conditionally render the Tooltip component when an item is hovered */}
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
                // Add mouse handlers only if an item exists in the slot
                onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
                onMouseLeave={item ? handleMouseLeave : undefined}
              >
                <div
                  className={`equip-slot ${item ? 'has-item' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => handleSlotClick(slot, !!item)}
                >
                  <div className="slot-label">{slot.replace('_', ' ').toLowerCase()}</div>
                  <div className="slot-item-name">
                    {item ? item.name : '----'}
                  </div>
                </div>

                {selectedSlot === slot && item && (
                  <div className="item-actions">
                    <button onClick={() => onItemAction('examine', item.name)}>Details</button>
                    <button onClick={() => onItemAction('unequip', item.name)}>Unequip</button>
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
