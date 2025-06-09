// client/src/components/Game.tsx
import { useState, useEffect, useRef } from 'react';
import { StatsPanel } from './StatsPanel';
import { InventoryPanel } from './InventoryPanel';
import type { Player, Item } from '../types';

// ... (Room, GamePayload, ServerMessage interfaces) ...
interface Room { name: string; description: string; exits: { [direction: string]: string }; }
interface GamePayload { message: string; player?: Player; room?: Room; players?: string[]; roomItems?: Item[]; inventory?: Item[]; } // <-- ADD inventory
interface ServerMessage { type: 'gameUpdate' | 'message'; payload: GamePayload; }
interface GameProps {
  token: string;
  characterId: string;
}

export function Game({ token, characterId }: GameProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  // ... (other states remain the same)
  const [inventory, setInventory] = useState<Item[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [playersInRoom, setPlayersInRoom] = useState<string[]>([]);
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const WS_URL = (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001') + `?token=${token}`;
    socket.current = new WebSocket(WS_URL);

    // --- NEW: Select character on connection ---
    socket.current.onopen = () => {
      console.log('WebSocket connected. Selecting character...');
      const selectCommand = {
        action: 'selectCharacter',
        payload: characterId,
      };
      socket.current?.send(JSON.stringify(selectCommand));
    };

    socket.current.onmessage = (event) => {
      // ... (onmessage logic remains the same)
      const serverMessage: ServerMessage = JSON.parse(event.data);
      const { type, payload } = serverMessage;
      if (payload.message) { setMessages(prev => [...prev, payload.message]); }
      if (type === 'gameUpdate') {
        if (payload.player) setPlayer(payload.player);

        if (payload.inventory) setInventory(payload.inventory);
        if (payload.room) setRoom(payload.room);
        if (payload.players) setPlayersInRoom(payload.players);
        if (payload.roomItems) setRoomItems(payload.roomItems);
      }
    };

    socket.current.onclose = () => { setMessages(prev => [...prev, "Connection to server lost."]); };
    return () => { socket.current?.close(); };
  }, [token, characterId]); // Add characterId as a dependency

  const handleSendCommand = () => { /* ... (this function remains the same) ... */
    if (!inputValue.trim()) return;
    const parts = inputValue.toLowerCase().trim().split(' ');
    const command = { action: parts[0], payload: parts.slice(1).join(' ') };
    if (socket.current) { socket.current.send(JSON.stringify(command)); }
    setInputValue('');
  };

  // --- RENDER ---
  return (
    <div className="game-layout">
      <div className="left-panel">
        <StatsPanel player={player} />
        <InventoryPanel items={inventory} /> {/* <-- ADDED InventoryPanel component */}
      </div>
      <div className="main-panel">
        {/* ... (main panel JSX remains the same) ... */}
        <div className="room-info">
          <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
          <p>{room?.description}</p>
          {roomItems.length > 0 && <p className="room-items">You also see: {roomItems.map(item => item.name).join(', ')}.</p>}
          {playersInRoom.length > 0 && <p>Also here: {playersInRoom.join(', ')}</p>}
          {room && <p>Exits: {Object.keys(room.exits).join(', ')}</p>}
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
        {/* ... (input area JSX remains the same) ... */}
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()} placeholder="Type 'look', 'move north', etc."/>
        <button onClick={handleSendCommand}>Send</button>
      </div>
    </div>
  );
}