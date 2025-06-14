// client/src/components/CharacterCreate.tsx
import { useState } from 'react';

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
        // Send both the name and the selected class
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
    <div className="character-create">
      <h3>Create Your Character</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="char-name">Character Name</label>
          <input
            type="text"
            id="char-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        {/* --- NEW: Class Selection Dropdown --- */}
        <div className="form-group">
          <label htmlFor="char-class">Class</label>
          <select
            id="char-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {availableClasses.map(className => (
              <option key={className} value={className}>
                {className.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Create Character</button>
      </form>
    </div>
  );
}
