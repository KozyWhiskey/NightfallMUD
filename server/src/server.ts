// server/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import cors from 'cors';
import url from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient, Class } from '@prisma/client';
import { GameEngine, Command, GameEvent } from './game/gameEngine';
import { startingClassData } from './game/class.data';
import dotenv from 'dotenv';

dotenv.config();

// --- SETUP AND CONFIG ---
const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined!");

const prisma = new PrismaClient();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", optionsSuccessStatus: 200 }));
app.use(express.json());

// --- WEBSOCKET AND GAME LOGIC (Needs to be defined before GameEngine is created) ---
const characterSockets: Map<string, WebSocket> = new Map();

// This function needs to be declared before it's passed to the GameEngine constructor.
async function processAndSendEvents(events: GameEvent[]) {
  for (const event of events) {
    const targetSocket = characterSockets.get(event.target);
    if (targetSocket?.readyState === WebSocket.OPEN) {
      targetSocket.send(JSON.stringify({ type: event.type, payload: event.payload }));
    } else if (event.target === 'room') {
      // Defensive check for payload
      if (!event.payload || typeof event.payload.roomId !== 'string') continue;
      
      const charactersInRoom = await game.getCharactersInRoom(event.payload.roomId, event.payload.exclude?.[0]);
      charactersInRoom.forEach(c => {
        const charSocket = characterSockets.get(c.id);
        if (charSocket?.readyState === WebSocket.OPEN) {
          charSocket.send(JSON.stringify({ type: 'message', payload: { message: event.payload.message } }));
        }
      });
    }
  }
};

// Create a single instance of the game engine and pass the broadcast function
const game = new GameEngine(processAndSendEvents);


// --- AUTHENTICATION MIDDLEWARE ---
export interface AuthenticatedRequest extends Request {
  user?: { accountId: string; username: string; };
}
const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Token required.' });
  
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET) as { accountId: string; username: string };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// --- API ROUTES ---
// AUTH: Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await prisma.account.create({ data: { username, password: hashedPassword } });
    res.status(201).json({ message: 'Account created.', accountId: account.id });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Username already exists.' });
    res.status(500).json({ message: 'Registration error.' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });
  try {
    const account = await prisma.account.findUnique({ where: { username } });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ accountId: account.id, username: account.username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login error.' });
  }
});

// CHARACTERS: Get all for account
app.get('/api/characters', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized.' });
  try {
    const characters = await prisma.character.findMany({ where: { accountId: req.user.accountId } });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch characters.' });
  }
});

// CHARACTERS: Create new
app.post('/api/characters', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized.' });
  const { name, characterClass } = req.body;
  if (!name || !characterClass) return res.status(400).json({ message: 'Character name and class are required.' });
  if (!Object.values(Class).includes(characterClass)) return res.status(400).json({ message: 'Invalid class.' });
  const classData = startingClassData[characterClass as Class];
  if (!classData) return res.status(500).json({ message: 'Class data not found.' });
  try {
    const newCharacter = await prisma.character.create({
      data: { name, class: characterClass, accountId: req.user.accountId, currentRoomId: 'room-1', ...classData.stats },
    });
    res.status(201).json(newCharacter);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Character name already exists.' });
    res.status(500).json({ message: 'Internal error creating character.' });
  }
});

// --- WEBSOCKET SERVER ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws: WebSocket, req) => {
  let accountId = '';
  try {
    const location = new url.URL(req.url || '', `ws://${req.headers.host}`);
    const token = location.searchParams.get('token');
    if (!token) throw new Error('No token provided.');
    const decodedToken = jwt.verify(token, JWT_SECRET) as { accountId: string };
    accountId = decodedToken.accountId;
    console.log(`✅ Account ${accountId} authenticated via WebSocket.`);
  } catch (error) {
    ws.close(1008, "Invalid authentication token");
    return;
  }
  
  let characterId = '';
  ws.on('message', async (messageStr: RawData) => {
    try {
      const command: Command = JSON.parse(messageStr.toString());
      if (!characterId && command.action === 'selectCharacter') {
        const selectedCharId = command.payload;
        const character = await prisma.character.findFirst({ where: { id: selectedCharId, accountId: accountId }});
        if (!character) throw new Error('Character not found or does not belong to this account.');
        characterId = character.id;
        characterSockets.set(characterId, ws);
        console.log(`🎮 Character ${characterId} selected for gameplay.`);
        const initialEvents = await game.handleCharacterConnect(characterId);
        await processAndSendEvents(initialEvents);
      } else if (characterId) {
        const responseEvents = await game.processCommand(characterId, command);
        await processAndSendEvents(responseEvents);
      }
    } catch (error: any) { 
      console.error(`Error processing command:`, error);
      ws.send(JSON.stringify({ type: 'message', payload: { message: `Error: ${error.message}` }}));
    }
  });

  ws.on('close', async () => {
    if (characterId) {
      console.log(`❌ Character ${characterId} disconnected.`);
      const departureEvent = await game.handleCharacterDisconnect(characterId);
      if (departureEvent) { await processAndSendEvents([departureEvent]); }
      characterSockets.delete(characterId);
    } else {
      console.log(`🔌 Unassigned connection closed.`);
    }
  });
});

server.listen(port, () => { console.log(`✅ Server is running on http://localhost:${port}`); });
