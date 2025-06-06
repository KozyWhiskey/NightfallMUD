// server/src/game/world.ts

export interface Room {
    id: string;
    name: string;
    description: string;
    exits: { [direction: string]: string }; // e.g., { north: 'room-2' }
  }
  
  export const world: { [id: string]: Room } = {
    'room-1': {
      id: 'room-1',
      name: 'The Town Square',
      description: 'You are standing in the bustling town square. Cobblestone paths lead away in all directions. In the center, a large fountain gurgles peacefully.',
      exits: {
        north: 'room-2',
        east: 'room-3',
      },
    },
    'room-2': {
      id: 'room-2',
      name: 'The North Road',
      description: 'You are on a dusty road leading north out of town. The town square is to the south. A dense forest looms to the north.',
      exits: {
        south: 'room-1',
      },
    },
    'room-3': {
      id: 'room-3',
      name: 'The Armory',
      description: 'You stand inside the town armory. Racks of swords and shields line the walls. The exit is to the west.',
      exits: {
        west: 'room-1',
      },
    },
  };