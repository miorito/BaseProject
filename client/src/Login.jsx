import { useState } from 'react';
import './Login.css';

export default function Login({ onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setMessage({ type: 'error', text: 'Server returned an invalid response' });
        return;
      }

      if (res.ok && data.success) {
        setLoggedIn(true);
        setMessage({
          type: 'success',
          text: data.message,
          userName: data.user?.name || email,
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Unable to reach server. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  if (loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Welcome back</h1>
          <p className="success-text">
            You are logged in as {message?.userName || email}
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setLoggedIn(false);
              setEmail('');
              setPassword('');
              setMessage(null);
            }}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="subtitle">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {message && (
            <p className={message.type === 'success' ? 'success-text' : 'error-text'}>
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-button" onClick={onNavigateRegister}>
            Register
          </button>
        </p>

        <div className="auth-link">
          <button type="button" className="link-button">
          <a href="https://www.google.com">About us</a>
          </button>
        </div>

        <div className="auth-link">
          <button type="button" className="link-button">
          <a href="https://www.google.com">About us</a>
          </button>
        </div>

      </div>
    </div>
  );
}
