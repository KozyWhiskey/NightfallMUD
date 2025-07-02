// client/src/App.tsx
import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Game } from './components/Game';
import { CharacterSelect } from './components/CharacterSelect';
import { Header } from './components/Header'; // <-- Import the new Header
import { Box } from '@chakra-ui/react';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nightfall-token'));
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('nightfall-token', token);
    } else {
      localStorage.removeItem('nightfall-token');
      setSelectedCharacterId(null);
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };

  const handleLogout = () => {
    setToken(null);
  };

  // This function will be passed to the Game component to allow it to reset the character selection
  const handleSwitchCharacter = () => {
    setSelectedCharacterId(null);
  }

  const renderContent = () => {
    if (token && selectedCharacterId) {
      return <Game token={token} characterId={selectedCharacterId} />;
    } else if (token) {
      return <CharacterSelect token={token} onCharacterSelect={handleCharacterSelect} onLogout={handleLogout} />;
    } else {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <Box className="App">
      <Header isLoggedIn={!!token} onLogout={handleLogout} />
      <Box as="main" pt="50px">
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;
