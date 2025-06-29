// server/src/data/index.ts
import { allAffixes } from './affixes';
import { baseItemTypes } from './baseItemTypes';
import { havenRooms } from './zones/haven';

// Consolidate all room templates from all zones into one object
const allRoomTemplates = {
  ...havenRooms,
};

// Extract all mob templates from all rooms into a single array
const allMobTemplates = Object.values(allRoomTemplates).flatMap(room => 
  room.mobTemplates.map(mobTemplate => ({ ...mobTemplate, roomId: room.id }))
);

// Export all our master data lists from this central hub
export { 
  allAffixes, 
  baseItemTypes, 
  allRoomTemplates, 
  allMobTemplates 
};
