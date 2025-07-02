// client/src/components/CharacterSelect.tsx
import { useState, useEffect, useCallback } from 'react';
import { CharacterCreate } from './CharacterCreate';
import { Box, VStack, HStack, Heading, Text } from '@chakra-ui/react';

interface CharacterSummary {
  id: string;
  name: string;
  level: number;
}

interface CharacterSelectProps {
  token: string;
  onCharacterSelect: (characterId: string) => void;
  onLogout: () => void; // Add this prop
}

export function CharacterSelect({ token, onCharacterSelect}: CharacterSelectProps) {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/characters', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch characters.');
      const data = await response.json();
      setCharacters(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw" bg="gray.900" color="gray.100">
        <Heading as="h2" size="lg">Loading Characters...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw" bg="gray.900" color="gray.100">
        <Heading as="h2" size="lg">Error: {error}</Heading>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw" bg="gray.900" color="gray.100">
      <Box w="100%" maxW="500px" bg="gray.800" p="40px" borderRadius="lg" boxShadow="lg" textAlign="center">
        <Heading as="h1" size="lg" mb={6}>Select a Character</Heading>
        {characters.length > 0 ? (
          <>
            <Box as="ul" p={0} m={0} style={{ listStyle: 'none' }}>
              {characters.map(char => (
                <Box
                  as="li"
                  key={char.id}
                  bg="gray.700"
                  mb="10px"
                  p="20px"
                  borderRadius="md"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  cursor="pointer"
                  transition="background-color 0.2s, transform 0.2s"
                  _hover={{ bg: 'gray.600', transform: 'scale(1.02)' }}
                  onClick={() => onCharacterSelect(char.id)}
                >
                  <Text fontSize="1.2rem" fontWeight="bold">{char.name}</Text>
                  <Text fontSize="0.9rem" color="gray.400">Level {char.level}</Text>
                </Box>
              ))}
            </Box>
            <Box mt="30px" pt="30px" borderTop="1px solid" borderColor="gray.700">
              <CharacterCreate token={token} onCharacterCreated={fetchCharacters} />
            </Box>
          </>
        ) : (
          <CharacterCreate token={token} onCharacterCreated={fetchCharacters} />
        )}
      </Box>
    </Box>
  );
}
