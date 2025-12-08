import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        setMsg('Registered successfully. You can login now.');
        setForm({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Register</h2>

      {error && (
        <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>
      )}
      {msg && (
        <p style={{ color: 'green', fontSize: '14px' }}>{msg}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name</label>
          <br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '6px' }}
            type="text"
            placeholder="Enter your name"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <br />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '6px' }}
            type="email"
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <br />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '6px' }}
            type="password"
            placeholder="Enter password"
          />
        </div>

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: '10px' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
