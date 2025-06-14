// client/src/components/Game.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { StatsPanel } from './StatsPanel';
import { InventoryPanel } from './InventoryPanel';
import { LevelUpModal } from './LevelUpModal';
import { AvatarPanel } from './AvatarPanel';
import { TabbedView } from './TabbedView';
import type { Player, Item, Mob } from '../types';
import { Hostility } from '../types';

// --- Interfaces ---
interface Room { name: string; description: string; exits: { [direction: string]: string }; }
interface GamePayload { message: string; player?: Player; room?: Room; players?: string[]; roomItems?: Item[]; inventory?: Item[]; mobs?: Mob[]; }
interface ServerMessage { type: 'gameUpdate' | 'message'; payload: GamePayload; }
interface GameProps { token: string; characterId: string; onSwitchCharacter: () => void; }

// --- Component ---
export function Game({ token, characterId, onSwitchCharacter }: GameProps) {
  // --- State ---
  const [player, setPlayer] = useState<Player | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [playersInRoom, setPlayersInRoom] = useState<string[]>([]);
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [mobsInRoom, setMobsInRoom] = useState<Mob[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const equippedItems = useMemo(() => inventory.filter(item => item.equipped), [inventory]);
  const backpackItems = useMemo(() => inventory.filter(item => !item.equipped), [inventory]);

  // --- Effects ---
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const WS_URL = (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001') + `?token=${token}`;
    socket.current = new WebSocket(WS_URL);
    socket.current.onopen = () => { socket.current?.send(JSON.stringify({ action: 'selectCharacter', payload: characterId })); };
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
        if (payload.mobs !== undefined) setMobsInRoom(payload.mobs);
      }
    };
    socket.current.onclose = () => { setMessages(prev => [...prev, "Connection to server lost."]); };
    return () => { socket.current?.close(); };
  }, [token, characterId]);

  // --- Handlers ---
  const handleSendCommand = (commandToSend?: string) => {
    const commandValue = commandToSend || inputValue;
    if (!commandValue.trim()) return;
    let commandObject;
    try {
      commandObject = JSON.parse(commandValue);
    } catch (e) {
      const parts = commandValue.toLowerCase().trim().split(' ');
      commandObject = { action: parts[0], payload: parts.slice(1).join(' ') };
    }
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(commandObject));
    }
    if (!commandToSend) {
      setInputValue('');
    }
  };

  const handleItemAction = (action: string, itemName: string) => {
    handleSendCommand(`${action} ${itemName}`);
  };

  const handleConfirmLevelUp = (assignedPoints: Record<string, number>) => {
    handleSendCommand(JSON.stringify({ action: 'assignStats', payload: assignedPoints }));
    setIsLevelUpVisible(false);
  };
  
  const getMobClass = (hostility: Hostility) => {
    switch (hostility) {
      case Hostility.HOSTILE: return 'mob-hostile';
      case Hostility.FRIENDLY: return 'mob-friendly';
      default: return 'mob-neutral';
    }
  };

  // --- Tab Definitions ---
  const leftPanelTabs = [
    { label: 'Stats', content: <StatsPanel player={player} onLevelUpClick={() => setIsLevelUpVisible(true)} /> },
    { label: 'Equipped', content: <AvatarPanel equippedItems={equippedItems} onItemAction={handleItemAction} /> },
  ];
  const rightPanelTabs = [
    { label: 'Backpack', content: <InventoryPanel items={backpackItems} onItemAction={handleItemAction} /> },
    { label: 'Quests', content: <div>Quest Log Coming Soon!</div> },
    { label: 'Map', content: <div>Map Coming Soon!</div> }
  ];

  // --- RENDER ---
  return (
    <>
      {isLevelUpVisible && player && (
        <LevelUpModal player={player} onConfirm={handleConfirmLevelUp} onCancel={() => setIsLevelUpVisible(false)} />
      )}
      <div className="game-layout">
        <div className="side-panel left-panel">
          <TabbedView tabs={leftPanelTabs} />
        </div>
        <div className="main-panel">
          <div className="room-info">
            <h2>{room?.name || 'Connecting to NightfallMUD...'}</h2>
            <p>{room?.description}</p>
            {mobsInRoom.length > 0 && <p>Creatures here: {mobsInRoom.map((mob, index) => {
              const mobClass = getMobClass(mob.hostility);
              const canAttack = mob.hostility !== Hostility.FRIENDLY;
              return (
                <span key={mob.id}>
                  <button 
                    className={`mob-button ${mobClass}`} 
                    onClick={canAttack ? () => handleSendCommand(`attack ${mob.name}`) : undefined}
                    disabled={!canAttack}
                    title={canAttack ? `HP: ${mob.hp}/${mob.maxHp}` : `${mob.name} is friendly.`}
                  >
                    {mob.name}
                  </button>
                  {index < mobsInRoom.length - 1 && ', '}
                </span>
              )
            })}.</p>}
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
            {messages.map((msg, index) => {
              // --- NEW: Add conditional class logic ---
              const isDamageDealt = msg.startsWith('You attack') || msg.startsWith('You hit');
              const isDamageTaken = msg.includes('attacks you') || msg.includes('hits you');
              const isPresence = msg.includes('moves') || msg.includes('arrives') || msg.includes('has connected') || msg.includes('has left');
              
              const messageClass = isDamageDealt ? 'damage-dealt' : 
                                   isDamageTaken ? 'damage-taken' : 
                                   isPresence ? 'presence-message' : '';

              return (
                <div key={index} className={messageClass}>
                  {`> ${msg}`}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="right-panel-container">
          <div className="side-panel right-panel">
            <TabbedView tabs={rightPanelTabs} />
          </div>
        </div>
        <div className="input-area full-width">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()} placeholder="Type a command..."/>
          <button onClick={() => handleSendCommand()}>Send</button>
        </div>
      </div>
    </>
  );
}
