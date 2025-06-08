import { useState, useEffect, useRef } from 'react';
import './App.css';

// Interfaces to match our data structures
interface Item {
  id: string;
  name: string;
  description: string;
}

interface Room {
  name: string;
  description: string;
  exits: { [direction: string]: string };
}

interface GamePayload {
  message: string;
  room?: Room;
  players?: string[];
  roomItems?: Item[]; // <-- ADDED
}

interface ServerMessage {
  type: 'gameUpdate' | 'message';
  payload: GamePayload;
}

function App() {
  // Game state
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [roomItems, setRoomItems] = useState<Item[]>([]); // <-- ADDED
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
    socket.current = new WebSocket(WS_URL);

    socket.current.onmessage = (event) => {
      const serverMessage: ServerMessage = JSON.parse(event.data);
      const { type, payload } = serverMessage;

      if (payload.message) {
        setMessages(prev => [...prev, payload.message]);
      }

      if (type === 'gameUpdate') {
        if (payload.room) setRoom(payload.room);
        if (payload.players) setPlayers(payload.players);
        // --- ADDED ---
        if (payload.roomItems) setRoomItems(payload.roomItems);
      }
    };

    return () => { socket.current?.close(); };
  }, []);

  const handleSendCommand = () => {
    if (!inputValue.trim()) return;
    const parts = inputValue.toLowerCase().trim().split(' ');
    const command = { action: parts[0], payload: parts.slice(1).join(' ') };
    if (socket.current) {
      socket.current.send(JSON.stringify(command));
    }
    setInputValue('');
  };

  return (
    <div className="app-container">
      <div className="game-screen">
        <div className="room-info">
          <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
          <p>{room?.description}</p>
          {/* --- ADDED DISPLAY LOGIC FOR ITEMS --- */}
          {roomItems.length > 0 && <p className="room-items">You also see: {roomItems.map(item => item.name).join(', ')}.</p>}
          {players.length > 0 && <p>Also here: {players.join(', ')}</p>}
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
      <div className="input-area">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()} placeholder="Type 'look', 'move north', etc."/>
        <button onClick={handleSendCommand}>Send</button>
      </div>
    </div>
  );
}

export default App;