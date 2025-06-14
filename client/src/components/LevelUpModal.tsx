// client/src/components/LevelUpModal.tsx
import { useState } from 'react';
import type { Player } from '../types';
import './LevelUpModal.css';

interface LevelUpModalProps {
  player: Player;
  onConfirm: (assignedPoints: Record<string, number>) => void;
  onCancel: () => void; // Add a way to close the modal
}

const coreStats: Array<keyof Player> = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export function LevelUpModal({ player, onConfirm, onCancel }: LevelUpModalProps) {
  const [pointsToSpend, setPointsToSpend] = useState(player.unspentStatPoints);
  const [assignedPoints, setAssignedPoints] = useState<Record<string, number>>({});

  const handleIncrement = (stat: keyof Player) => {
    if (pointsToSpend > 0) {
      setPointsToSpend(prev => prev - 1);
      setAssignedPoints(prev => ({
        ...prev,
        [stat]: (prev[stat] || 0) + 1,
      }));
    }
  };

  // --- NEW DECREMENT FUNCTION ---
  const handleDecrement = (stat: keyof Player) => {
    // Only allow decrementing if a point has been assigned to this stat
    if ((assignedPoints[stat] || 0) > 0) {
      setPointsToSpend(prev => prev + 1);
      setAssignedPoints(prev => ({
        ...prev,
        [stat]: prev[stat] - 1,
      }));
    }
  };

  const handleReset = () => {
    setPointsToSpend(player.unspentStatPoints);
    setAssignedPoints({});
  };

  const handleConfirm = () => {
    if (pointsToSpend === 0 && Object.keys(assignedPoints).length > 0) {
      onConfirm(assignedPoints);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="level-up-modal" onClick={e => e.stopPropagation()}>
        <h2>You have reached a new level!</h2>
        <p>You have <strong>{pointsToSpend}</strong> attribute points to spend.</p>
        <div className="stats-assignment">
          {coreStats.map(stat => (
            <div className="stat-row" key={stat}>
              <span className="stat-name">{stat.toUpperCase()}</span>
              <span className="stat-value">
                {player[stat] as number + (assignedPoints[stat] || 0)}
              </span>
              <div className="stat-buttons">
                {/* --- ADDED DECREMENT BUTTON --- */}
                <button onClick={() => handleDecrement(stat)} disabled={(assignedPoints[stat] || 0) === 0}>-</button>
                <button onClick={() => handleIncrement(stat)} disabled={pointsToSpend === 0}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={handleReset}>Reset</button>
          <button onClick={handleConfirm} disabled={pointsToSpend > 0}>Confirm</button>
        </div>
      </div>
    </div>
  );
}