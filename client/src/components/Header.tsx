// client/src/components/Header.tsx
import { Flex, Box, Heading, Button } from '@chakra-ui/react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  // We can add more props here later, like onSwitchCharacter
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h="50px"
      bg="gray.900"
      borderBottom="1px solid"
      borderColor="gray.700"
      alignItems="center"
      justifyContent="space-between"
      px="20px"
      boxSizing="border-box"
      zIndex={1000}
      color="gray.100"
    >
      <Box>
        <Heading as="h1" m={0} fontSize="1.5rem" fontWeight={500}>
          NightfallMUD
        </Heading>
      </Box>
      <Flex gap="15px">
        {isLoggedIn && (
          <Button
            px="16px"
            py="8px"
            bg="gray.700"
            border="1px solid"
            borderColor="gray.600"
            color="gray.100"
            borderRadius="md"
            _hover={{ bg: 'gray.600' }}
            onClick={onLogout}
          >
            Logout
          </Button>
        )}
        {/* We can add other buttons like 'Help' or 'Settings' here later */}
      </Flex>
    </Flex>
  );
}
