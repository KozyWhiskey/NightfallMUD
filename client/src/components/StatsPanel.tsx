import type { Player } from '../types';
import './StatsPanel.css';

interface StatsPanelProps {
  player: Player | null;
  onLevelUpClick: () => void;
}

export function StatsPanel({ player, onLevelUpClick }: StatsPanelProps) {
  if (!player) {
    return <div className="stats-panel">Loading...</div>;
  }

  // NOTE: This condition is no longer needed here, but the logic is sound.
  // We now check for unspent points below.
  const readyToLevelUp = player.experience >= player.experienceToNextLevel;

  return (
    <div className="stats-panel">
      <h3>{player.username}</h3>
      <p>Level: {player.level}</p>

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
      
      {/* --- THIS IS THE CORRECTED CONDITION --- */}
      {/* Show the button if the player has points to spend. */}
      {player.unspentStatPoints > 0 && (
        <button className="level-up-button" onClick={onLevelUpClick}>
          Level Up! ({player.unspentStatPoints} points available)
        </button>
      )}

      <div className="core-stats">
        <h4>Attributes</h4>
        <p>STR: {player.strength}</p>
        <p>DEX: {player.dexterity}</p>
        <p>CON: {player.constitution}</p>
        <p>INT: {player.intelligence}</p>
        <p>WIS: {player.wisdom}</p>
        <p>CHA: {player.charisma}</p>
        <p>DEF: {player.defense}</p>
      </div>

      <div className="other-info">
        <p>Gold: {player.gold}</p>
      </div>
    </div>
  );
}