// NightfallMUD/client/src/components/Auth.tsx

import { useState } from 'react';
import './Auth.css'; // We will create this CSS file next

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
        setIsLoginView(true); // Switch to login view after successful registration
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLoginView ? 'Login to NightfallMUD' : 'Register for NightfallMUD'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit">{isLoginView ? 'Login' : 'Register'}</button>
        </form>
        <p className="toggle-view">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? 'Register Here' : 'Login Here'}
          </button>
        </p>
      </div>
    </div>
  );
}