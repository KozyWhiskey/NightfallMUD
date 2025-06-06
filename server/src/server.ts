import express from 'express';
import http from 'http';
// Import 'RawData' in addition to the others
import { WebSocketServer, WebSocket, RawData } from 'ws';
import cors from 'cors';
import { GameEngine, Command } from './game/gameEngine';

const app = express();
const port = 3001;

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const game = new GameEngine();
const playersockets: Map<string, WebSocket> = new Map();

wss.on('connection', (ws: WebSocket) => { // <-- Explicitly type 'ws' as WebSocket
  const playerId = `player-${Date.now()}`;
  playersockets.set(playerId, ws);

  console.log(`✅ Player ${playerId} connected.`);

  const initialState = game.addPlayer(playerId);
  ws.send(JSON.stringify(initialState));

  ws.on('message', (messageStr: RawData) => { // <-- Explicitly type 'messageStr' as RawData
    try {
      const command: Command = JSON.parse(messageStr.toString());
      console.log(`Received command from ${playerId}:`, command);

      const response = game.processCommand(playerId, command);
      ws.send(JSON.stringify(response));

    } catch (error) {
      console.error(`Error processing command from ${playerId}:`, error);
      ws.send(JSON.stringify({ message: "Error: Invalid command format." }));
    }
  });

  ws.on('close', () => {
    console.log(`❌ Player ${playerId} disconnected.`);
    game.removePlayer(playerId);
    playersockets.delete(playerId);
  });
});

server.listen(port, () => {
  console.log(`✅ Game server is running on http://localhost:${port}`);
});