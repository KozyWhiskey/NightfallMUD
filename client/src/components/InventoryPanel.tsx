// client/src/components/InventoryPanel.tsx
import type { Item } from '../types';
import './InventoryPanel.css';

interface InventoryPanelProps {
  items: Item[];
}

export function InventoryPanel({ items }: InventoryPanelProps) {
  return (
    <div className="inventory-panel">
      <h4>Inventory</h4>
      <div className="inventory-list">
        {items.length === 0 ? (
          <p className="empty-inventory">You are not carrying anything.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="inventory-item" title={item.description}>
              {item.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}