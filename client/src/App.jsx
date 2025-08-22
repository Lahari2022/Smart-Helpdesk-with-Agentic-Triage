import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Tickets from './pages/Tickets.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import KB from './pages/KB.jsx'
import Settings from './pages/Settings.jsx'
import { useAuth } from './hooks/useAuth.js'

function Nav() {
  const { user, logout } = useAuth()
  return (
    <nav style={{display:'flex', gap:12, padding:12, borderBottom:'1px solid #ddd'}}>
      <Link to="/">Tickets</Link>
      {user?.role === 'admin' && <Link to="/kb">KB</Link>}
      {user?.role === 'admin' && <Link to="/settings">Settings</Link>}
      <span style={{marginLeft:'auto'}}>
        {user ? (<>
          <b>{user.name}</b> <button onClick={logout}>Logout</button>
        </>) : (<Link to="/login">Login</Link>)}
      </span>
    </nav>
  )
}

function Private({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div>
      <Nav />
      <div style={{padding:16}}>
        <Routes>
          <Route path="/" element={<Private><Tickets /></Private>} />
          <Route path="/ticket/:id" element={<Private><TicketDetail /></Private>} />
          <Route path="/kb" element={<Private roles={['admin']}><KB /></Private>} />
          <Route path="/settings" element={<Private roles={['admin']}><Settings /></Private>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  )
}
