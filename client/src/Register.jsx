import { useState } from 'react';
import './Login.css';

export default function Register({ onNavigateLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setMessage({ type: 'error', text: 'Server returned an invalid response' });
        return;
      }

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => onNavigateLogin(), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Unable to reach server. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create account</h1>
        <p className="subtitle">Fill in your details to register</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            autoComplete="given-name"
          />

          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            autoComplete="family-name"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
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
            autoComplete="new-password"
          />

          <label htmlFor="confirm_password">Confirm password</label>
          <input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          {message && (
            <p className={message.type === 'success' ? 'success-text' : 'error-text'}>
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onNavigateLogin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
