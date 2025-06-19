// client/src/components/MessageLogPanel.tsx
import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

export function MessageLogPanel() {
  const messages = useGameStore(state => state.messages);
  const logRef = useRef<HTMLDivElement>(null);

  // This effect ensures the log stays scrolled to the bottom (newest message)
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0; // Scroll to the top of the reversed flex container
    }
  }, [messages]);
  
  const getMessageClass = (msg: string) => {
    const isDamageDealt = msg.includes('You hit') || msg.includes('You attack');
    const isDamageTaken = msg.includes('hits you');
    const isPresence = msg.includes('moves') || msg.includes('arrives') || msg.includes('has connected') || msg.includes('has left') || msg.includes('becomes aggressive');
    return isDamageDealt ? 'damage-dealt' : isDamageTaken ? 'damage-taken' : isPresence ? 'presence-message' : '';
  };

  return (
    // The inner wrapper div has been removed.
    <div className="message-log" ref={logRef}>
      {messages.map((msg, index) => (
        <div key={index} className={getMessageClass(msg)}>
          {`> ${msg}`}
        </div>
      )).reverse()} {/* Reverse the array so new messages appear at the bottom */}
    </div>
  );
}
