// client/src/components/MessageLogPanel.tsx
import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { Box, Text } from '@chakra-ui/react';

export function MessageLogPanel() {
  const messages = useGameStore(state => state.messages);
  const logRef = useRef<HTMLDivElement>(null);

  // This effect ensures the log stays scrolled to the bottom (newest message)
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0; // Scroll to the top of the reversed flex container
    }
  }, [messages]);
  
  const getMessageColor = (msg: string) => {
    const isDamageDealt = msg.includes('You hit') || msg.includes('You attack');
    const isDamageTaken = msg.includes('hits you');
    const isPresence = msg.includes('moves') || msg.includes('arrives') || msg.includes('has connected') || msg.includes('has left') || msg.includes('becomes aggressive');
    return isDamageDealt ? 'green.300' : isDamageTaken ? 'red.400' : isPresence ? 'blue.200' : 'gray.200';
  };

  const panelBg = 'gray.900';

  return (
    <Box
      bg={panelBg}
      borderRadius="lg"
      boxShadow="md"
      p={2}
      h="100%"
      overflowY="auto"
      ref={logRef}
      fontFamily="mono"
      fontSize="sm"
      flex="1"
    >
      {[...messages].reverse().map((msg, index) => (
        <Text key={index} color={getMessageColor(msg)}>
          {`> ${msg}`}
        </Text>
      ))}
    </Box>
  );
}
