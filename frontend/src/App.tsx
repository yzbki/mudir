import { useEffect, useState } from 'react'
import './App.css'

type User = {
  id: number
  name: string
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setMessage('')
      return
    }

    fetch('http://localhost:8080/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Invalid token')
        }

        return response.json()
      })
      .then((data) => {
        setUser(data)
        setMessage('')
      })
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
        setMessage('')
      })
  }, [])

  const handleSubmit = async () => {
    const endpoint =
      mode === 'signup'
        ? '/api/auth/register'
        : '/api/auth/login'

    const body =
      mode === 'signup'
        ? { name, email, password }
        : { email, password }

    try {
      const response = await fetch(
        `http://localhost:8080${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          typeof data === 'string'
            ? data
            : 'Something went wrong'
        )
        return
      }

      localStorage.setItem('token', data.token)
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
      })

      setName('')
      setEmail('')
      setPassword('')
      setMessage('')
    } catch (error) {
      console.error(error)
      setMessage('Failed to connect to backend')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setMessage('')
  }

  const deleteAccount = async () => {
    const token = localStorage.getItem('token')

    if (!token) return

    const confirmed = window.confirm(
      'Are you sure you want to delete your account?'
    )

    if (!confirmed) return

    const response = await fetch(
      'http://localhost:8080/api/auth/account',
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.ok) {
      localStorage.removeItem('token')
      setUser(null)
      setMessage('Account deleted successfully')
    } else {
      setMessage('Failed to delete account')
    }
  }

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="logo">Mudir</div>

        <nav className="navigation">
          <button>Dashboard</button>
          <button>Employees</button>
          <button>Inventory</button>
          <button>Tasks</button>
          <button>Customers</button>
        </nav>

        <button
          className="login-button"
          onClick={user ? logout : () => setMode('login')}
        >
          {user ? 'Logout' : 'Login'}
        </button>
      </aside>

      <main className="main-content">

        {!user ? (
          <div className="auth-container">

            <h1>
              {mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
            </h1>

            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Log in to your Mudir account.'
                : 'Create an account to get started.'}
            </p>

            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="primary-button"
              onClick={handleSubmit}
            >
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </button>

            <button
              className="switch-button"
              onClick={() => {
                setMode(
                  mode === 'login'
                    ? 'signup'
                    : 'login'
                )
                setMessage('')
              }}
            >
              {mode === 'login'
                ? 'Create an account'
                : 'Already have an account? Log in'}
            </button>

            {message && (
              <p className="message">{message}</p>
            )}

          </div>
        ) : (
          <div className="account-container">

            <h1>Dashboard</h1>

            <div className="account-card">
              <h2>Welcome, {user.name}</h2>

              <p>{user.email}</p>

              <button
                className="delete-button"
                onClick={deleteAccount}
              >
                Delete Account
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}

export default App