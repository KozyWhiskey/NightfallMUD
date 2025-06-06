import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors'; // Import the cors middleware
import { GameEngine, Command } from './game/gameEngine'; // Import our game engine

const app = express();
const port = 3001;

// --- CORS (Cross-Origin Resource Sharing) Configuration ---
// This is crucial for allowing your frontend (on a different domain) to make API calls to this backend.
const corsOptions = {
  // The 'origin' is the URL of your live frontend. We use an environment variable
  // for production and fallback to the localhost URL for development.
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Use the cors middleware for all HTTP routes

// --- Server Setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Create a single instance of our game engine
const game = new GameEngine();

// Map to associate WebSocket connections with player IDs
const playersockets: Map<string, WebSocket> = new Map();

// --- WebSocket Connection Logic ---
wss.on('connection', (ws) => {
  // Generate a unique ID for the player.
  const playerId = `player-${Date.now()}`;
  playersockets.set(playerId, ws);

  console.log(`✅ Player ${playerId} connected.`);

  // Add player to the game engine and get the initial state
  const initialState = game.addPlayer(playerId);
  // Send the initial game state as a JSON string
  ws.send(JSON.stringify(initialState));

  // Listen for messages from this specific client
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

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`❌ Player ${playerId} disconnected.`);
    game.removePlayer(playerId);
    playersockets.delete(playerId);
  });
});

// --- Start the Server ---
server.listen(port, () => {
  console.log(`✅ Game server is running on http://localhost:${port}`);
});