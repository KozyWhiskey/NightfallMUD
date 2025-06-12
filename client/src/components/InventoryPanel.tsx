// client/src/components/InventoryPanel.tsx
import { useState } from 'react';
import type { Item } from '../types';
import './InventoryPanel.css';

interface InventoryPanelProps {
  items: Item[];
  // We will pass down a function to handle actions from the parent
  onItemAction: (action: string, itemName: string) => void;
}

export function InventoryPanel({ items, onItemAction }: InventoryPanelProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleItemClick = (itemId: string) => {
    // Toggle selection: if clicking the same item, unselect it.
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  return (
    <div className="inventory-panel">
      <h4>Inventory</h4>
      <div className="inventory-list">
        {items.length === 0 ? (
          <p className="empty-inventory">You are not carrying anything.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="inventory-item-container">
              <div
                className={`inventory-item ${selectedItemId === item.id ? 'selected' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.name}
              </div>

              {/* --- Conditionally rendered action buttons --- */}
              {selectedItemId === item.id && (
                <div className="item-actions">
                  <button onClick={() => onItemAction('examine', item.name)}>Examine</button>
                  <button onClick={() => onItemAction('drop', item.name)}>Drop</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}