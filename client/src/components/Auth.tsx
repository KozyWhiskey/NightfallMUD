// NightfallMUD/client/src/components/Auth.tsx

import { useState } from 'react';
import { Box, Flex, Heading, Field, Input, Button, Text } from '@chakra-ui/react';

interface AuthProps {
  onLoginSuccess: (token: string) => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      if (isLoginView) {
        onLoginSuccess(data.token);
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLoginView(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="gray.900"
      color="gray.100"
    >
      <Box
        p="40px"
        bg="gray.800"
        borderRadius="lg"
        boxShadow="lg"
        w="100%"
        maxW="400px"
        textAlign="center"
      >
        <Heading as="h2" mb="24px" color="gray.100">
          {isLoginView ? 'Login to NightfallMUD' : 'Register for NightfallMUD'}
        </Heading>
        <form onSubmit={handleSubmit}>
          <Field.Root mb="16px" textAlign="left">
            <Field.Label htmlFor="username" fontSize="0.9rem" color="gray.400" mb="8px">
              Username
            </Field.Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              w="100%"
              p="10px"
              bg="gray.900"
              border="1px solid"
              borderColor="gray.700"
              borderRadius="md"
              color="gray.100"
              boxSizing="border-box"
            />
          </Field.Root>
          <Field.Root mb="16px" textAlign="left">
            <Field.Label htmlFor="password" fontSize="0.9rem" color="gray.400" mb="8px">
              Password
            </Field.Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              w="100%"
              p="10px"
              bg="gray.900"
              border="1px solid"
              borderColor="gray.700"
              borderRadius="md"
              color="gray.100"
              boxSizing="border-box"
            />
          </Field.Root>
          {error && <Text color="red.300" mt="10px" fontSize="0.9rem">{error}</Text>}
          {message && <Text color="green.200" mt="10px" fontSize="0.9rem">{message}</Text>}
          <Button
            type="submit"
            w="100%"
            p="12px"
            mt="16px"
            border="none"
            borderRadius="md"
            bg="purple.400"
            color="white"
            fontSize="1rem"
            cursor="pointer"
            _hover={{ bg: 'purple.600' }}
            transition="background-color 0.3s"
          >
            {isLoginView ? 'Login' : 'Register'}
          </Button>
        </form>
        <Text mt="24px" fontSize="0.9rem">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <Button
            bg="none"
            border="none"
            color="purple.300"
            cursor="pointer"
            textDecoration="underline"
            pl="5px"
            fontSize="0.9rem"
            onClick={() => setIsLoginView(!isLoginView)}
          >
            {isLoginView ? 'Register Here' : 'Login Here'}
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}