// client/src/components/InventoryPanel.tsx
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore'; // <-- Import the store
import type { Item } from '../types';
import { Tooltip } from './Tooltip';
import './InventoryPanel.css';

// This component no longer needs props
export function InventoryPanel() {
  // --- Get state and actions directly from the store ---
  const inventory = useGameStore(state => state.inventory);
  const sendCommand = useGameStore(state => state.sendCommand);

  // --- Derived state to get only backpack items ---
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
  
  // --- NEW: Use the sendCommand action from the store ---
  const handleItemAction = (action: string, itemName: string) => {
    const commandObject = {
        action: action.toLowerCase(),
        payload: itemName.toLowerCase(),
    };
    sendCommand(commandObject);
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
                  {item.name}
                </div>
                
                {selectedItemId === item.id && (
                  <div className="item-actions">
                    <button onClick={() => handleItemAction('examine', item.name)}>Examine</button>
                    {item.slot !== 'NONE' && (
                      <button onClick={() => handleItemAction('equip', item.name)}>Equip</button>
                    )}
                    <button onClick={() => handleItemAction('drop', item.name)}>Drop</button>
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
