// client/src/components/InventoryPanel.tsx
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import type { Item } from '../types';
import { Tooltip } from './Tooltip';
import './InventoryPanel.css';

export function InventoryPanel() {
  const inventory = useGameStore(state => state.inventory);
  const sendCommand = useGameStore(state => state.sendCommand);
  const backpackItems = useMemo(() => inventory.filter(item => !item.equipped), [inventory]);
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(prev => (prev === itemId ? null : itemId));
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
      <div className="inventory-panel">
        <h4>Backpack</h4>
        <div className="inventory-list">
          {backpackItems.length === 0 ? (
            <p className="empty-inventory">Your backpack is empty.</p>
          ) : (
            backpackItems.map(item => (
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
                  {item.baseItem.name}
                </div>
                
                {selectedItemId === item.id && (
                  <div className="item-actions">
                    <button onClick={() => handleItemAction('examine', item.baseItem.name)}>Examine</button>
                    {item.baseItem.slot !== 'NONE' && (
                      <button onClick={() => handleItemAction('equip', item.baseItem.name)}>Equip</button>
                    )}
                    <button onClick={() => handleItemAction('drop', item.baseItem.name)}>Drop</button>
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
