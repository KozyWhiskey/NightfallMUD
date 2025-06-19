// client/src/components/CombatPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { MobCard } from './MobCard';
import './CombatPanel.css';

// This component no longer needs props
export function CombatPanel() {
  // --- THIS IS THE FIX ---
  // Select each piece of state individually to prevent re-renders.
  const mobs = useGameStore(state => state.mobsInRoom);
  const player = useGameStore(state => state.player);
  const sendCommand = useGameStore(state => state.sendCommand);
  const isActionDisabled = useGameStore(state => state.isActionDisabled);
  const roundTimerKey = useGameStore(state => state.roundTimerKey);

  const handleMobAttack = (mobName: string) => {
    sendCommand({ action: 'attack', payload: mobName });
  };

  // If there are no mobs, don't render anything
  if (mobs.length === 0) {
    return null;
  }

  return (
    <div className="combat-panel">
      <div className="mob-card-container">
        {mobs.map(mob => (
          <MobCard 
            key={mob.id} 
            mob={mob} 
            player={player}
            onAttack={handleMobAttack}
            isActionDisabled={isActionDisabled}
          />
        ))}
      </div>
      <div key={roundTimerKey} className="round-timer-bar"></div>
    </div>
  );
}
