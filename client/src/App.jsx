import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function App() {
  const [page, setPage] = useState('login');

  if (page === 'register') {
    return <Register onNavigateLogin={() => setPage('login')} />;
  }

  return <Login onNavigateRegister={() => setPage('register')} />;
}
