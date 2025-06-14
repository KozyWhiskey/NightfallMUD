// client/src/components/Tooltip.tsx
import type { Item } from '../types';
import './Tooltip.css';

interface TooltipProps {
  item: Item;
}

// A helper to format attribute names nicely (e.g., 'fireDamage' -> 'Fire Damage')
const formatAttributeName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
};

export function Tooltip({ item }: TooltipProps) {
  const attributes = item.attributes as Record<string, number>;

  return (
    <div className="tooltip">
      <div className="tooltip-header">
        <span className="tooltip-name">{item.name}</span>
        <span className="tooltip-slot">{item.slot}</span>
      </div>
      <p className="tooltip-description">{item.description}</p>
      <div className="tooltip-stats">
        {Object.entries(attributes).map(([key, value]) => (
          <div key={key} className="stat-line">
            <span>{formatAttributeName(key)}</span>
            <span>+{value}</span>
          </div>
        ))}
        <div className="stat-line weight">
          <span>Weight</span>
          <span>{item.weight}</span>
        </div>
      </div>
    </div>
  );
}
