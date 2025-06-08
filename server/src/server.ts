// server/src/server.ts
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import cors from 'cors';
import { GameEngine, Command, GameEvent } from './game/gameEngine';

const app = express();
const port = 3001;
const corsOptions = { origin: process.env.CORS_ORIGIN || "http://localhost:5173", optionsSuccessStatus: 200 };
app.use(cors(corsOptions));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const game = new GameEngine();
const playerSockets: Map<string, WebSocket> = new Map();

// Helper function now needs to be async to await getPlayersInRoom
const processAndSendEvents = async (events: GameEvent[]) => {
  for (const event of events) {
    if (event.target === 'room') {
      const playersInRoom = await game.getPlayersInRoom(event.payload.roomId, event.payload.exclude?.[0]);
      playersInRoom.forEach(p => {
        const playerSocket = playerSockets.get(p.id);
        if (playerSocket?.readyState === WebSocket.OPEN) {
          // Note: we are creating a simpler payload for broadcasts
          playerSocket.send(JSON.stringify({ type: event.type, payload: { message: event.payload.message } }));
        }
      });
    } else {
      const playerSocket = playerSockets.get(event.target);
      if (playerSocket?.readyState === WebSocket.OPEN) {
        playerSocket.send(JSON.stringify({ type: event.type, payload: event.payload }));
      }
    }
  }
};

wss.on('connection', async (ws: WebSocket) => { // <-- Main handler is now async
  const playerId = `player-${Date.now()}`;
  playerSockets.set(playerId, ws);
  console.log(`✅ Player ${playerId} connected.`);

  try {
    const initialEvents = await game.addPlayer(playerId);
    await processAndSendEvents(initialEvents);

    ws.on('message', async (messageStr: RawData) => { // <-- Message handler is now async
      try {
        const command: Command = JSON.parse(messageStr.toString());
        console.log(`Received command from ${playerId}:`, command);
        const responseEvents = await game.processCommand(playerId, command);
        await processAndSendEvents(responseEvents);
      } catch (error) {
        console.error(`Error processing command from ${playerId}:`, error);
      }
    });

    ws.on('close', async () => { // <-- Close handler is now async
      console.log(`❌ Player ${playerId} disconnected.`);
      const departureEvent = await game.removePlayer(playerId);
      if (departureEvent) {
        await processAndSendEvents([departureEvent]);
      }
      playerSockets.delete(playerId);
    });
  } catch (error) {
    console.error(`Error during player connection ${playerId}:`, error);
    ws.close();
  }
});

server.listen(port, () => {
  console.log(`✅ Game server is running on http://localhost:${port}`);
});