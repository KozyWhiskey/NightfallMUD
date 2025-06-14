// client/src/components/InventoryPanel.tsx
import { useState } from 'react';
import type { Item } from '../types';
import { Tooltip } from './Tooltip'; // <-- Import the new Tooltip component
import './InventoryPanel.css';

interface InventoryPanelProps {
  items: Item[];
  onItemAction: (action: string, itemName: string) => void;
}

export function InventoryPanel({ items, onItemAction }: InventoryPanelProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // --- NEW: State for handling the tooltip ---
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(prev => (prev === itemId ? null : itemId));
  };

  // --- NEW: Handlers for mouse events to show/hide tooltip ---
  const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
    setHoveredItem(item);
    // Position the tooltip slightly offset from the mouse cursor
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {/* Conditionally render the Tooltip component when an item is hovered */}
      {hoveredItem && <Tooltip item={hoveredItem} style={{ top: tooltipPosition.y, left: tooltipPosition.x }} />}

      <div className="inventory-panel">
        <h4>Backpack</h4>
        <div className="inventory-list">
          {items.length === 0 ? (
            <p className="empty-inventory">Your backpack is empty.</p>
          ) : (
            items.map(item => (
              <div 
                key={item.id} 
                className="inventory-item-container"
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`inventory-item ${selectedItemId === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  {item.name}
                </div>
                
                {selectedItemId === item.id && (
                  <div className="item-actions">
                    <button onClick={() => onItemAction('examine', item.name)}>Examine</button>
                    {item.slot !== 'NONE' && (
                      <button onClick={() => onItemAction('equip', item.name)}>Equip</button>
                    )}
                    <button onClick={() => onItemAction('drop', item.name)}>Drop</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
