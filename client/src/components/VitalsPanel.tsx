// client/src/components/VitalsPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import './VitalsPanel.css';

export function VitalsPanel() {
  const player = useGameStore(state => state.player);

  if (!player) {
    return <div className="vitals-panel loading">Loading Vitals...</div>;
  }

  return (
    <div className="vitals-panel">
      <div className="character-header">
        <span className="character-name">{player.name}</span>
        <span className="character-level">Level {player.level}</span>
      </div>
      
      {/* HP Bar */}
      <div className="stat-bar" title={`HP: ${player.hp} / ${player.maxHp}`}>
        <div className="stat-bar-fill hp" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div>
        <div className="stat-bar-label">HP</div>
        <div className="stat-bar-text">{player.hp} / {player.maxHp}</div>
      </div>

      {/* Mana Bar */}
      <div className="stat-bar" title={`Mana: ${player.mana} / ${player.maxMana}`}>
        <div className="stat-bar-fill mana" style={{ width: `${(player.mana / player.maxMana) * 100}%` }}></div>
        <div className="stat-bar-label">MP</div>
        <div className="stat-bar-text">{player.mana} / {player.maxMana}</div>
      </div>
      
      {/* XP Bar */}
      <div className="stat-bar" title={`XP: ${player.experience} / ${player.experienceToNextLevel}`}>
        <div className="stat-bar-fill xp" style={{ width: `${(player.experience / player.experienceToNextLevel) * 100}%` }}></div>
        <div className="stat-bar-label">XP</div>
        <div className="stat-bar-text">{player.experience} / {player.experienceToNextLevel}</div>
      </div>
    </div>
  );
}
