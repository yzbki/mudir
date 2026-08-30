import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error(error)
        setMessage('Failed to connect to backend')
      })
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">MUDIR</div>

        <nav className="navigation">
          <button>Dashboard</button>
          <button>Employees</button>
          <button>Inventory</button>
          <button>Tasks</button>
          <button>Customers</button>
          <button>Settings</button>
        </nav>

        <button className="login-button">
          Login
        </button>
      </aside>

      <main className="main-content">
        <h1>Dashboard</h1>
        <p>{message}</p>
      </main>
    </div>
  )
}

export default App