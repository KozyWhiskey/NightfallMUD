// client/src/components/MapPanel.tsx
import { useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import type { Room } from '../types';
import './MapPanel.css';

export function MapPanel() {
  // --- THIS IS THE FIX ---
  // Get the current room and all rooms in the zone directly from our global store.
  const currentRoom = useGameStore(state => state.room);
  const allRoomsInZone = useGameStore(state => state.zoneRooms);

  // useMemo will re-calculate the map grid only when the room data changes
  const mapData = useMemo(() => {
    // The rest of this function is unchanged, but now uses live data
    if (!currentRoom || !allRoomsInZone || allRoomsInZone.length === 0) {
      return null;
    }

    const currentZ = currentRoom.z;
    const roomsOnSameFloor = allRoomsInZone.filter(r => r.z === currentZ);

    if (roomsOnSameFloor.length === 0) return null;

    // Determine the boundaries of the map
    const xCoords = roomsOnSameFloor.map(r => r.x);
    const yCoords = roomsOnSameFloor.map(r => r.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Create a 2D array representing the grid, filled with nulls
    const grid: (Room | null)[][] = Array(height).fill(null).map(() => Array(width).fill(null));

    // Place each room into its correct grid cell based on its coordinates
    roomsOnSameFloor.forEach(r => {
      const gridX = r.x - minX;
      const gridY = maxY - r.y; // Invert Y so that positive Y is "up"
      if (grid[gridY] && grid[gridY][gridX] === null) {
        grid[gridY][gridX] = r;
      }
    });

    return { grid, currentRoomId: currentRoom.id };
  }, [currentRoom, allRoomsInZone]);

  if (!mapData) {
    return (
      <div className="map-panel">
        <p className="map-loading-text">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-panel">
      <div className="map-grid" style={{ gridTemplateColumns: `repeat(${mapData.grid[0].length}, 24px)` }}>
        {mapData.grid.map((row, y) => (
            row.map((cell: Room | null, x: number) => (
              <div
                key={`${x}-${y}`}
                className={`map-cell ${cell ? 'is-room' : ''} ${cell?.id === mapData.currentRoomId ? 'current-room' : ''}`}
                title={cell?.name || 'Unexplored'}
              >
                {cell ? (cell.id === mapData.currentRoomId ? '*' : '■') : ''}
              </div>
            ))
        ))}
      </div>
    </div>
  );
}
