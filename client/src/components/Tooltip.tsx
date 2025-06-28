// client/src/components/Tooltip.tsx
import type { Item } from '../types';
import './Tooltip.css';

interface TooltipProps {
  item: Item;
  style: React.CSSProperties;
}

const formatAttributeName = (name: string) => {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export function Tooltip({ item, style }: TooltipProps) {
  // Access all properties through the nested template object
  const { name, slot, description, weight, attributes } = item.template;
  const itemAttributes = attributes as Record<string, number>;

  return (
    <div className="tooltip" style={style}>
      <div className="tooltip-header">
        <span className="tooltip-name">{name}</span>
        <span className="tooltip-slot">{slot}</span>
      </div>
      <p className="tooltip-description">{description}</p>
      <div className="tooltip-stats">
        {Object.entries(itemAttributes).map(([key, value]) => (
          <div key={key} className="stat-line">
            <span>{formatAttributeName(key)}</span>
            <span>+{value}</span>
          </div>
        ))}
        <div className="stat-line weight">
          <span>Weight</span>
          <span>{weight}</span>
        </div>
      </div>
    </div>
  );
}
