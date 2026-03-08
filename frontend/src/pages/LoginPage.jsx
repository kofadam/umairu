import { useState } from 'react'
import { login } from '../api'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(username, password)
      onLogin(res.data.token)
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoJa}>うまいる</span>
          <span style={styles.logoSub}>RECIPE BOOK</span>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafaf8',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '48px 40px',
    width: 360,
    boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 32,
    gap: 4,
  },
  logoJa: {
    fontSize: 28,
    fontWeight: 500,
    letterSpacing: 2,
    color: '#1a1a1a',
  },
  logoSub: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#999',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    padding: '12px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: 'inherit',
  },
  error: {
    color: '#e53e3e',
    fontSize: 13,
    margin: 0,
  },
}