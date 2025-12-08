import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [name, setName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');

    // If user is not logged in, redirect to login page
    if (!storedName) {
      window.location.href = '/login';
    } else {
      setName(storedName);
    }
  }, []);

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Dashboard</h2>

      <p>Welcome, <strong>{name}</strong></p>

      <button
        onClick={() => {
          localStorage.removeItem('userName');
          window.location.href = '/login';
        }}
        style={{
          marginTop: '20px',
          padding: '8px 14px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}
