import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';

export function InputPanel() {
  const [inputValue, setInputValue] = useState('');
  const sendCommand = useGameStore(state => state.sendCommand);
  const isActionDisabled = useGameStore(state => state.isActionDisabled);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  // --- NEW: This effect handles auto-focusing the input box ---
  useEffect(() => {
    // When an action is no longer disabled (i.e., a round ends), focus the input.
    if (!isActionDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActionDisabled]);

  const handleSendCommand = () => {
    if (!inputValue.trim()) return;
    const parts = inputValue.toLowerCase().trim().split(' ');
    const commandObject = { action: parts[0], payload: parts.slice(1).join(' ') };
    sendCommand(commandObject);
    setInputValue('');
  };

  return (
    <div className="input-area">
      <input 
        ref={inputRef} // Attach the ref
        type="text" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()} 
        placeholder={isActionDisabled ? "Waiting for next round..." : "Type a command..."}
        disabled={isActionDisabled}
        autoFocus // Focus the input when the component first loads
      />
      <button onClick={handleSendCommand} disabled={isActionDisabled}>Send</button>
    </div>
  );
}