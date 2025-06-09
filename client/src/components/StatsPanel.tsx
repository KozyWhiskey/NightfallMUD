// client/src/components/StatsPanel.tsx
import type { Player } from '../types';
import './StatsPanel.css';

interface StatsPanelProps {
  player: Player | null;
}

export function StatsPanel({ player }: StatsPanelProps) {
  if (!player) {
    return <div className="stats-panel">Loading...</div>;
  }

  return (
    <div className="stats-panel">
      <h3>{player.username}</h3>
      <p>Level: {player.level}</p>
      <div className="stat-bar">
        <div className="stat-bar-label">HP</div>
        <div className="stat-bar-inner hp" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}>
          {player.hp} / {player.maxHp}
        </div>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-label">MP</div>
        <div className="stat-bar-inner mana" style={{ width: `${(player.mana / player.maxMana) * 100}%` }}>
          {player.mana} / {player.maxMana}
        </div>
      </div>
      <div className="core-stats">
        <h4>Attributes</h4>
        <p>STR: {player.strength}</p>
        <p>DEX: {player.dexterity}</p>
        <p>CON: {player.constitution}</p>
        <p>INT: {player.intelligence}</p>
        <p>WIS: {player.wisdom}</p>
        <p>CHA: {player.charisma}</p>
      </div>
      <div className="other-info">
        <p>Gold: {player.gold}</p>
        <p>XP: {player.experience}</p>
      </div>
    </div>
  );
}