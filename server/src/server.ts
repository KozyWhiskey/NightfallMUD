// server/src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import { webService } from './services/web.service';
import { gameService } from './services/game.service';

const port = process.env.PORT || 3001;

webService.start(Number(port));
gameService.start();

console.log('🚀 Server starting...');