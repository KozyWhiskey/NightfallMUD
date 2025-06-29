
// server/src/services/ipc.emitter.ts
import { EventEmitter } from 'events';

// This is a simple in-process event emitter that will serve as the communication
// bridge between the WebService and the GameService. This allows us to decouple
// the services without needing an external message broker like Redis for now.

class IPCEmitter extends EventEmitter {}

export const ipcEmitter = new IPCEmitter();
