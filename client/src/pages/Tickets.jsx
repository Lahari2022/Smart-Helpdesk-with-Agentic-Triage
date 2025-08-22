import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { AuthProvider, useAuth } from '../hooks/useAuth.js'

export default function Tickets() {
  return (
    <AuthProvider>
      <TicketsInner />
    </AuthProvider>
  )
}

function TicketsInner() {
  const { token } = useAuth()
  const [items, setItems] = React.useState([])
  const [title, setTitle] = React.useState('Refund for double charge')
  const [description, setDescription] = React.useState('I was charged twice for order #1234')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  async function load() {
    try {
      setLoading(true)
      const data = await api('/api/tickets?mine=true', { token })
      setItems(data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  React.useEffect(()=>{ load() }, [])
  async function create(e) {
    e.preventDefault()
    try {
      const res = await api('/api/tickets', { method:'POST', body:{ title, description }, token })
      setTitle(''); setDescription(''); load()
      alert(`Ticket created with status: ${res.ticket.status}`)
    } catch (e) { alert(e.message) }
  }
  return (
    <div style={{display:'grid', gap:16}}>
      <h2>My Tickets</h2>
      <form onSubmit={create} style={{display:'grid', gap:8, maxWidth:520}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe your issue" required />
        <button type="submit">Create Ticket</button>
      </form>
      {loading ? <p>Loading...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
        <ul>
          {items.map(t => (
            <li key={t._id}>
              <Link to={`/ticket/${t._1}`}>{t.title}</Link> — <i>{t.status}</i>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
