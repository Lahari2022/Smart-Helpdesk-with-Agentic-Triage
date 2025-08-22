import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { AuthProvider, useAuth } from '../hooks/useAuth.js'

export default function Login() {
  return (
    <AuthProvider>
      <LoginInner />
    </AuthProvider>
  )
}

function LoginInner() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = React.useState('user@example.com')
  const [password, setPassword] = React.useState('password123')
  const [err, setErr] = React.useState('')
  async function onSubmit(e) {
    e.preventDefault()
    try {
      const { token } = await api('/api/auth/login', { method:'POST', body:{ email, password } })
      const [,payload] = token.split('.')
      const data = JSON.parse(atob(payload))
      login(token, { name: data.name, role: data.role })
      nav('/')
    } catch (e) { setErr(e.message) }
  }
  return (
    <form onSubmit={onSubmit} style={{display:'grid', gap:8, maxWidth:340, margin:'40px auto'}}>
      <h2>Login</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      <Link to="/register">Create account</Link>
    </form>
  )
}
