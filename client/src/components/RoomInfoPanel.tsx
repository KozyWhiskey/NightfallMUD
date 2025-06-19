// client/src/components/RoomInfoPanel.tsx
import { useGameStore } from '../stores/useGameStore';
import { Hostility } from '../types';

export function RoomInfoPanel() {
  // --- THIS IS THE FIX ---
  // Select each piece of state individually to prevent re-renders.
  const room = useGameStore(state => state.room);
  const mobsInRoom = useGameStore(state => state.mobsInRoom);
  const roomItems = useGameStore(state => state.roomItems);
  const playersInRoom = useGameStore(state => state.playersInRoom);
  const sendCommand = useGameStore(state => state.sendCommand);

  const handleCommandClick = (action: string, payload: string) => {
    sendCommand({ action: action.toLowerCase(), payload: payload.toLowerCase() });
  };
  
  const getMobClass = (hostility: Hostility) => {
    switch (hostility) {
      case Hostility.HOSTILE: return 'mob-hostile';
      case Hostility.FRIENDLY: return 'mob-friendly';
      default: return 'mob-neutral';
    }
  };

  return (
    <div className="room-info">
      <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
      <p>{room?.description}</p>
      
      {mobsInRoom.length > 0 && <p>Creatures here: {mobsInRoom.map((mob, index) => {
        const mobClass = getMobClass(mob.hostility);
        const canAttack = mob.hostility !== Hostility.FRIENDLY;
        return (
          <span key={mob.id}>
            <button 
              className={`mob-button ${mobClass}`} 
              disabled={!canAttack} 
              title={canAttack ? `HP: ${mob.hp}/${mob.maxHp}` : `${mob.name} is friendly.`}
            >
              {mob.name}
            </button>
            {index < mobsInRoom.length - 1 && ', '}
          </span>
        )
      })}.</p>}

      {roomItems.length > 0 && <p className="room-items">You also see: {roomItems.map((item, index) => (
        <span key={item.id}>
          <button className="item-button" onClick={() => handleCommandClick('get', item.name)} title={item.description}>{item.name}</button>
          {index < roomItems.length - 1 && ', '}
        </span>
      ))}.</p>}

      {playersInRoom.length > 0 && <p>Also here: {playersInRoom.join(', ')}</p>}

      {room && <p>Exits: {Object.keys(room.exits).map((direction, index) => (
        <span key={direction}>
          <button className="exit-button" onClick={() => handleCommandClick('move', direction)}>{direction}</button>
          {index < Object.keys(room.exits).length - 1 && ', '}
        </span>
      ))}</p>}
    </div>
  );
}
