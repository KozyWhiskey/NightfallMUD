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
  const { description, rarity, baseItem, itemAffixes } = item;
  const { name, slot, baseWeight, baseDamage, baseArmor, baseMagicResist } = baseItem;

  return (
    <div className="tooltip" style={style}>
      <div className="tooltip-header">
        <span className="tooltip-name">{name}</span>
        <span className="tooltip-rarity">{rarity}</span>
        <span className="tooltip-slot">{slot}</span>
      </div>
      <p className="tooltip-description">{description}</p>
      <div className="tooltip-stats">
        {baseDamage && (
          <div className="stat-line">
            <span>Damage</span>
            <span>{baseDamage}</span>
          </div>
        )}
        {baseArmor && (
          <div className="stat-line">
            <span>Armor</span>
            <span>{baseArmor}</span>
          </div>
        )}
        {baseMagicResist && (
          <div className="stat-line">
            <span>Magic Resist</span>
            <span>{baseMagicResist}</span>
          </div>
        )}
        {itemAffixes.map(itemAffix => (
          Object.entries(itemAffix.value).map(([key, value]) => (
            <div key={`${itemAffix.id}-${key}`} className="stat-line affix-line">
              <span>{itemAffix.affix.name} ({formatAttributeName(key)})</span>
              <span>+{value}</span>
            </div>
          ))
        ))}
        <div className="stat-line weight">
          <span>Weight</span>
          <span>{baseWeight}</span>
        </div>
      </div>
    </div>
  );
}
