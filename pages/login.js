import { useState } from 'react';

export default function Login() {
  const [form, setForm] = useState({
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

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setMsg('');
//     setError('');

//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || 'Invalid credentials');
//       } else {
//         setMsg('Login successful');
//         // for basic version, we just show message
//         // if you want, you can redirect:
//         // window.location.href = '/';
//       }
//     } catch (err) {
//       setError('Network error');
//     }
//   }

async function handleSubmit(e) {
  e.preventDefault();
  setMsg('');
  setError('');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Invalid credentials');
    } else {
      localStorage.setItem('userName', data.user.name);
      window.location.href = '/dashboard';
    }
  } catch (err) {
    setError('Network error');
  }
}


return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Login</h2>

      {error && (
        <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>
      )}
      {msg && (
        <p style={{ color: 'green', fontSize: '14px' }}>{msg}</p>
      )}

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: '10px' }}>
        Don&apos;t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
