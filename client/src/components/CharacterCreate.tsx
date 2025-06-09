// client/src/components/CharacterCreate.tsx
import { useState } from 'react';

interface CharacterCreateProps {
  token: string;
  onCharacterCreated: () => void; // A function to tell the parent to refetch characters
}

export function CharacterCreate({ token, onCharacterCreated }: CharacterCreateProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create character.');
      }

      // Tell the parent component that creation was successful
      onCharacterCreated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="character-create">
      <h3>Create Your First Character</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="char-name">Character Name</label>
          <input
            type="text"
            id="char-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Create Character</button>
      </form>
    </div>
  );
}