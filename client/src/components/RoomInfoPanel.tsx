// client/src/components/RoomInfoPanel.tsx
import { useGameStore } from '../stores/useGameStore';
// --- FIXED: Import Hostility as a value, not just a type ---
import { Hostility } from '../types';
import type { Mob, Item } from '../types';

export function RoomInfoPanel() {
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
      // --- FIXED: Use the enum member for comparison ---
      case Hostility.HOSTILE: return 'mob-hostile';
      case Hostility.FRIENDLY: return 'mob-friendly';
      default: return 'mob-neutral';
    }
  };

  return (
    <div className="room-info">
      <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
      <p>{room?.description}</p>
      
      {mobsInRoom.length > 0 && <p>Creatures here: {mobsInRoom.map((mob: Mob, index) => {
        const mobClass = getMobClass(mob.hostility);
        // --- FIXED: Use the enum member for comparison ---
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

      {roomItems.length > 0 && <p className="room-items">You also see: {roomItems.map((item: Item, index) => (
        <span key={item.id}>
          <button 
            className="item-button" 
            onClick={() => handleCommandClick('get', item.baseItem?.name || item.name)} 
            title={item.baseItem?.description || item.description || 'No description available'}
          >
            {item.baseItem?.name || item.name}
          </button>
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
