// server/src/data/index.ts
import { allItemTemplates } from './items';
import { havenRooms } from './zones/haven';
// In the future, you would import other zones here:
// import { gloomwoodRooms } from './zones/gloomwood';

// Consolidate all room templates from all zones into one object
export const allRoomTemplates = {
  ...havenRooms,
  // ...gloomwoodRooms,
};

// Export the master item list directly
export { allItemTemplates };
