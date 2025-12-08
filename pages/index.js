import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Basic Auth App</h1>
      <p>Login and registration using Next.js + MongoDB</p>

      <div style={{ marginTop: '20px' }}>
        <Link href="/register" style={{ marginRight: '10px' }}>
          Go to Register
        </Link>
        <Link href="/login">Go to Login</Link>
      </div>
    </div>
  );
}
