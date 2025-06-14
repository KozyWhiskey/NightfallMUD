// client/src/components/Header.tsx
import './Header.css';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  // We can add more props here later, like onSwitchCharacter
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-title">
        <h1>NightfallMUD</h1>
      </div>
      <div className="header-actions">
        {isLoggedIn && (
          <button onClick={onLogout} className="header-button">
            Logout
          </button>
        )}
        {/* We can add other buttons like 'Help' or 'Settings' here later */}
      </div>
    </header>
  );
}
