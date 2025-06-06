// server/src/game/player.ts

export class Player {
    public id: string;
    public currentRoomId: string;
  
    constructor(id: string, startingRoomId: string) {
      this.id = id;
      this.currentRoomId = startingRoomId;
    }
  }