// client/src/components/MobCard.tsx
import type { Mob, Player } from '../types';
import { Hostility } from '../types';
import './MobCard.css';

interface MobCardProps {
  mob: Mob;
  player: Player | null;
  onAttack: (mobName: string) => void;
  isActionDisabled: boolean; // <-- NEW: To disable the button during a round
}

export function MobCard({ mob, player, onAttack, isActionDisabled }: MobCardProps) {
  // Check if this mob is targeting the current player
  const isTargetingPlayer = mob.targetId === player?.id;

  const canAttack = mob.hostility !== Hostility.FRIENDLY;

  return (
    // Conditionally apply the 'targeting-player' class for the red border
    <div className={`mob-card ${isTargetingPlayer ? 'targeting-player' : ''}`}>
      <div className="mob-card-header">
        <span className="mob-name">{mob.name}</span>
        <span className="mob-level">Lvl {mob.level}</span>
      </div>
      <div className="mob-hp-bar">
        <div 
          className="mob-hp-bar-fill" 
          style={{ width: `${(mob.hp / mob.maxHp) * 100}%` }}
        ></div>
        <div className="mob-hp-bar-text">{mob.hp} / {mob.maxHp}</div>
      </div>
      <div className="mob-card-actions">
        {canAttack ? (
          <button 
            className="attack-button" 
            onClick={() => onAttack(mob.name)}
            disabled={isActionDisabled} // <-- NEW
          >
            Attack
          </button>
        ) : (
          <span className="friendly-text">Friendly</span>
        )}
      </div>
    </div>
  );
}
