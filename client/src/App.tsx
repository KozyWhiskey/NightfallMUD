import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Interfaces to match the backend's data structures
interface Room {
  name: string;
  description: string;
  exits: { [direction: string]: string };
}

interface GameResponse {
  message: string;
  room: Room;
}

function App() {
  // Game state
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll the message log to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect to manage WebSocket connection
  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3001');

    socket.current.onmessage = (event) => {
      const response: GameResponse = JSON.parse(event.data);

      // Add the server's message to our log
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
      }

      // Update the current room information
      if (response.room) {
        setRoom(response.room);
      }
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  const handleSendCommand = () => {
    if (!inputValue.trim()) return;

    const parts = inputValue.toLowerCase().trim().split(' ');
    const action = parts[0];
    const payload = parts.slice(1).join(' ');

    const command = { action, payload };

    if (socket.current) {
      socket.current.send(JSON.stringify(command));
    }
    setInputValue(''); // Clear input after sending
  };

  return (
    <div className="app-container">
      <div className="game-screen">
        <div className="room-info">
          <h2>{room?.name || 'Loading...'}</h2>
          <p>{room?.description}</p>
          {room && <p>Exits: {Object.keys(room.exits).join(', ')}</p>}
        </div>
        <div className="message-log">
          {messages.map((msg, index) => (
            <div key={index}>{`> ${msg}`}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
          placeholder="Type a command (e.g., 'look' or 'move north')"
        />
        <button onClick={handleSendCommand}>Send</button>
      </div>
    </div>
  );
}

export default App;