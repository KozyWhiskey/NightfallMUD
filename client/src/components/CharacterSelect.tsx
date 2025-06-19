// client/src/components/CharacterSelect.tsx
import { useState, useEffect, useCallback } from 'react';
import { CharacterCreate } from './CharacterCreate';
import './CharacterSelect.css';

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
    return <div className="character-select-container"><h2>Loading Characters...</h2></div>;
  }

  if (error) {
    return <div className="character-select-container"><h2>Error: {error}</h2></div>;
  }

  return (
    <div className="character-select-container">
      <div className="character-select-box">
        <h1>Select a Character</h1>
        {characters.length > 0 ? (
          <>
            <ul className="character-list">
              {characters.map(char => (
                <li key={char.id} onClick={() => onCharacterSelect(char.id)}>
                  <span className="char-name">{char.name}</span>
                  <span className="char-level">Level {char.level}</span>
                </li>
              ))}
            </ul>
            <div className="character-create">
              <CharacterCreate token={token} onCharacterCreated={fetchCharacters} />
            </div>
          </>
        ) : (
          <CharacterCreate token={token} onCharacterCreated={fetchCharacters} />
        )}
      </div>
    </div>
  );
}
