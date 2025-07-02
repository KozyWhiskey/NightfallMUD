// client/src/components/CharacterCreate.tsx
import { useState } from 'react';
import { Box, Input, Button, Heading } from '@chakra-ui/react';
import { Field, NativeSelect } from '@chakra-ui/react';

interface CharacterCreateProps {
  token: string;
  onCharacterCreated: () => void;
}

// An array of the available classes to populate our dropdown
const availableClasses = [
  'VANGUARD',
  'SHADOWBLADE',
  'AETHER_WEAVER',
  'DAWNKEEPER',
  'TECHNOMANCER',
  'GLOOM_WARDEN'
];

export function CharacterCreate({ token, onCharacterCreated }: CharacterCreateProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(availableClasses[0]); // Default to the first class
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedClass) {
      setError('Please select a class.');
      return;
    }

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, characterClass: selectedClass }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create character.');
      }

      onCharacterCreated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box bg="gray.900" borderRadius="lg" boxShadow="md" p={6} maxW="400px" mx="auto">
      <Heading as="h3" size="md" mb={4} color="blue.200" letterSpacing="wide">Create Your Character</Heading>
      <form onSubmit={handleSubmit}>
        <Field.Root required invalid={!!error} mb={4}>
          <Field.Label>Character Name</Field.Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="off"
            bg="gray.800"
            color="blue.100"
            borderColor="gray.700"
            _placeholder={{ color: 'gray.500' }}
          />
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Class</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              bg="gray.800"
              color="blue.100"
              borderColor="gray.700"
            >
              {availableClasses.map(className => (
                <option key={className} value={className}>
                  {className.replace('_', ' ')}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Button type="submit" colorScheme="blue" width="100%">Create Character</Button>
      </form>
    </Box>
  );
}
