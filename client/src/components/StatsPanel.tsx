// client/src/components/StatsPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import './StatsPanel.css';

interface StatsPanelProps {
  onLevelUpClick: () => void;
}

export function StatsPanel({ onLevelUpClick }: StatsPanelProps) {
  // It still gets the player data from the store
  const player = useGameStore(state => state.player);

  if (!player) {
    // Return null or a minimal loader if there's no player data yet
    return null;
  }

  const readyToLevelUp = player.unspentStatPoints > 0;

  return (
    // The panel content is now focused only on attributes
    <div className="stats-panel-content">
      {readyToLevelUp && (
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
        <p>RES: {player.resolve}</p>
      </div>

      <div className="other-info">
        <p>Gold: {player.gold}</p>
      </div>
    </div>
  );
}
