import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { Box, Input, Button, Flex } from '@chakra-ui/react';

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

  const panelBg = 'gray.900';

  return (
    <Box bg={panelBg} borderRadius="lg" boxShadow="md" p={1} mt={2} fontFamily="mono">
      <Flex direction="row" gap={1}>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
          placeholder={isActionDisabled ? "Waiting for next round..." : "Type a command..."}
          disabled={isActionDisabled}
          autoFocus
          color="blue.200"
          bg="gray.800"
          _placeholder={{ color: 'gray.500' }}
          fontFamily="mono"
          fontSize="sm"
          px={2}
          py={1}
        />
        <Button onClick={handleSendCommand} disabled={isActionDisabled} colorScheme="blue" fontSize="sm" px={3} py={1}>
          Send
        </Button>
      </Flex>
    </Box>
  );
}