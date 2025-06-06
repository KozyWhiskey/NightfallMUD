import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GameEngine, Command } from './game/gameEngine'; // Import our game engine

const app = express();
const port = 3001;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Create a single instance of our game engine
const game = new GameEngine();

// Map to associate WebSocket connections with player IDs
const playersockets: Map<string, WebSocket> = new Map();

wss.on('connection', (ws) => {
  // Generate a unique ID for the player.
  // In a real app, this would come from a login/authentication system.
  const playerId = `player-${Date.now()}`;
  playersockets.set(playerId, ws);

  console.log(`✅ Player ${playerId} connected.`);

  // Add player to the game engine and get the initial state
  const initialState = game.addPlayer(playerId);
  ws.send(JSON.stringify(initialState));

  ws.on('message', (messageStr) => {
    try {
      // Parse the command from the client
      const command: Command = JSON.parse(messageStr.toString());
      console.log(`Received command from ${playerId}:`, command);

      // Process the command in the game engine
      const response = game.processCommand(playerId, command);

      // Send the response back to the client
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