
// server/src/services/web.service.ts
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import cors from 'cors';
import url from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient, Class } from '@prisma/client';
import { Command, GameEvent } from '../game/gameEngine';
import { startingClassData } from '../game/class.data';
import { ipcEmitter } from './ipc.emitter';
import dotenv from 'dotenv';

export interface AuthenticatedRequest extends Request {
    user?: { accountId: string; username: string; };
}

dotenv.config();

class WebService {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private prisma = new PrismaClient();
  private characterSockets: Map<string, WebSocket> = new Map();
  private JWT_SECRET = process.env.JWT_SECRET as string;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocketServer();
    this.listenForGameEvents();

    if (!this.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined!");
    }
    console.log('✅ Web Service Initialized');
  }

  private setupMiddleware() {
    this.app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", optionsSuccessStatus: 200 }));
    this.app.use(express.json());
  }

  public authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Token required.' });
    
    const token = authHeader.split(' ')[1];
    try {
      (req as any).user = jwt.verify(token, this.JWT_SECRET) as { accountId: string; username: string };
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
  };

  private setupRoutes() {
    this.app.post('/api/auth/register', async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const account = await this.prisma.account.create({ data: { username, password: hashedPassword } });
          res.status(201).json({ message: 'Account created.', accountId: account.id });
        } catch (error: any) {
          if (error.code === 'P2002') return res.status(409).json({ message: 'Username already exists.' });
          console.error(error);
          res.status(500).json({ message: 'Registration error.' });
        }
    });

    this.app.post('/api/auth/login', async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });
        try {
          const account = await this.prisma.account.findUnique({ where: { username } });
          if (!account || !(await bcrypt.compare(password, account.password))) {
            return res.status(401).json({ message: 'Invalid credentials.' });
          }
          const token = jwt.sign({ accountId: account.id, username: account.username }, this.JWT_SECRET, { expiresIn: '24h' });
          res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Login error.' });
        }
    });

    this.app.get('/api/characters', this.authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'Not authorized.' });
        try {
          const characters = await this.prisma.character.findMany({ where: { accountId: req.user.accountId } });
          res.json(characters);
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch characters.' });
        }
    });

    this.app.post('/api/characters', this.authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'Not authorized.' });
        
        const { name, characterClass } = req.body;
        if (!name || !characterClass) return res.status(400).json({ message: 'Character name and class are required.' });
        if (!Object.values(Class).includes(characterClass)) return res.status(400).json({ message: 'Invalid class.' });
      
        const classData = startingClassData[characterClass as Class];
        if (!classData) return res.status(500).json({ message: 'Class data not found.' });
      
        try {
          const newCharacter = await this.prisma.character.create({
            data: {
              name,
              class: characterClass,
              accountId: req.user.accountId,
              currentRoomId: 'town-square',
              ...classData.stats,
            },
          });
          res.status(201).json(newCharacter);
        } catch (error: any) {
          if (error.code === 'P2002') return res.status(409).json({ message: 'Character name already exists.' });
          console.error("Error creating character:", error);
          res.status(500).json({ message: 'Internal error creating character.' });
        }
    });
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
        let accountId = '';
        try {
          const location = new url.URL(req.url || '', `ws://${req.headers.host}`);
          const token = location.searchParams.get('token');
          if (!token) throw new Error('No token provided.');
          const decodedToken = jwt.verify(token, this.JWT_SECRET) as { accountId: string };
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
              const character = await this.prisma.character.findFirst({ where: { id: selectedCharId, accountId: accountId }});
              if (!character) throw new Error('Character not found or does not belong to this account.');
              characterId = character.id;
              this.characterSockets.set(characterId, ws);
              console.log(`🎮 Character ${characterId} selected for gameplay.`);
              ipcEmitter.emit('characterConnected', characterId);
            } else if (characterId) {
              ipcEmitter.emit('command', characterId, command);
            }
          } catch (error: any) { 
            console.error(`Error processing command:`, error);
            ws.send(JSON.stringify({ type: 'message', payload: { message: `Error: ${error.message}` }}));
          }
        });
      
        ws.on('close', async () => {
          if (characterId) {
            console.log(`❌ Character ${characterId} disconnected.`);
            ipcEmitter.emit('characterDisconnected', characterId);
            this.characterSockets.delete(characterId);
          } else {
            console.log(`🔌 Unassigned connection closed.`);
          }
        });
      });
  }

  private listenForGameEvents() {
    ipcEmitter.on('events', (events: GameEvent[]) => {
        for (const event of events) {
            const targetSocket = this.characterSockets.get(event.target);
            if (targetSocket?.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({ type: event.type, payload: event.payload }));
            }
          }
    });
  }

  public start(port: number) {
    this.server.listen(port, () => {
      console.log(`✅ Web Service is running on http://localhost:${port}`);
    });
  }
}

export interface AuthenticatedRequest extends Request {
    user?: { accountId: string; username: string; };
}

export const webService = new WebService();
