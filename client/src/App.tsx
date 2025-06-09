// client/src/App.tsx
import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Game } from './components/Game';
import { CharacterSelect } from './components/CharacterSelect';
import './App.css';

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

  const renderContent = () => {
    if (token && selectedCharacterId) {
      return <Game token={token} characterId={selectedCharacterId} />;
    } else if (token) {
      return <CharacterSelect token={token} onCharacterSelect={handleCharacterSelect} />;
    } else {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
      
      {/* --- THIS IS THE FIX --- */}
      {/* Show the logout button as soon as a token exists, even before a character is selected */}
      {token && (
        <button onClick={handleLogout} className="logout-button">Logout</button>
      )}
    </div>
  );
}

export default App;