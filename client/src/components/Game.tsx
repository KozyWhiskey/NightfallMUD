// client/src/components/Game.tsx
import { useState, useEffect, useRef } from 'react';
import { StatsPanel } from './StatsPanel';
import { InventoryPanel } from './InventoryPanel';
import type { Player, Item, Mob } from '../types'; // <-- IMPORT Mob type

// Update GamePayload to include the new mobs array
interface GamePayload {
  message: string;
  player?: Player;
  room?: Room;
  players?: string[];
  roomItems?: Item[];
  inventory?: Item[];
  mobs?: Mob[]; // <-- ADDED
}

// Other interfaces (Room, ServerMessage, GameProps) remain the same
interface Room { name: string; description: string; exits: { [direction: string]: string }; }
interface ServerMessage { type: 'gameUpdate' | 'message'; payload: GamePayload; }
interface GameProps { token: string; characterId: string; }

export function Game({ token, characterId }: GameProps) {
  // --- STATE ---
  const [player, setPlayer] = useState<Player | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [playersInRoom, setPlayersInRoom] = useState<string[]>([]);
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [mobsInRoom, setMobsInRoom] = useState<Mob[]>([]); // <-- ADDED mob state
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const WS_URL = (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001') + `?token=${token}`;
    socket.current = new WebSocket(WS_URL);
    socket.current.onopen = () => {
      socket.current?.send(JSON.stringify({ action: 'selectCharacter', payload: characterId }));
    };
    socket.current.onmessage = (event) => {
      const serverMessage: ServerMessage = JSON.parse(event.data);
      const { type, payload } = serverMessage;
      if (payload.message) { setMessages(prev => [...prev, payload.message]); }
      if (type === 'gameUpdate') {
        if (payload.player) setPlayer(payload.player);
        if (payload.inventory !== undefined) setInventory(payload.inventory);
        if (payload.room) setRoom(payload.room);
        if (payload.players) setPlayersInRoom(payload.players);
        if (payload.roomItems !== undefined) setRoomItems(payload.roomItems);
        if (payload.mobs !== undefined) setMobsInRoom(payload.mobs); // <-- ADDED mob update
      }
    };
    socket.current.onclose = () => { setMessages(prev => [...prev, "Connection to server lost."]); };
    return () => { socket.current?.close(); };
  }, [token, characterId]);

  const handleSendCommand = (commandToSend?: string) => {
    const commandValue = commandToSend || inputValue;
    if (!commandValue.trim()) return;
    const parts = commandValue.toLowerCase().trim().split(' ');
    const command = { action: parts[0], payload: parts.slice(1).join(' ') };
    if (socket.current) { socket.current.send(JSON.stringify(command)); }
    if (!commandToSend) { setInputValue(''); }
  };

  // --- NEW FUNCTION TO PASS TO INVENTORY PANEL ---
  const handleItemAction = (action: string, itemName: string) => {
    handleSendCommand(`${action} ${itemName}`);
  };
  
  return (
    <div className="game-layout">
      <div className="left-panel">
        {/* Left panel is unchanged */}
        <StatsPanel player={player} />
        <InventoryPanel items={inventory} onItemAction={handleItemAction} />
      </div>
      <div className="main-panel">
        <div className="room-info">
          <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
          <p>{room?.description}</p>
          {/* --- NEW: Display Mobs in the room --- */}
          {mobsInRoom.length > 0 && <p className="room-mobs">Creatures here: {mobsInRoom.map(mob => mob.name).join(', ')}.</p>}
          {roomItems.length > 0 && <p className="room-items">You also see: {roomItems.map((item, index) => (
            <span key={item.id}>
              <button className="item-button" onClick={() => handleSendCommand(`get ${item.name}`)} title={item.description}>{item.name}</button>
              {index < roomItems.length - 1 && ', '}
            </span>
          ))}.</p>}
          {playersInRoom.length > 0 && <p>Also here: {playersInRoom.join(', ')}</p>}
          {room && <p>Exits: {Object.keys(room.exits).map((direction, index) => (
             <span key={direction}>
              <button className="exit-button" onClick={() => handleSendCommand(`move ${direction}`)}>{direction}</button>
              {index < Object.keys(room.exits).length - 1 && ', '}
            </span>
          ))}</p>}
        </div>
         <div className="message-log">
          {messages.map((msg, index) => (
            <div key={index} className={msg.includes('moves') || msg.includes('arrives') || msg.includes('has entered') || msg.includes('has left') ? 'presence-message' : ''}>
              {`> ${msg}`}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="input-area full-width">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()} placeholder="Type a command..."/>
        <button onClick={() => handleSendCommand()}>Send</button>
      </div>
    </div>
  );
}