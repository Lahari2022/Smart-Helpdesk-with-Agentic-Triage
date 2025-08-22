import React from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { AuthProvider, useAuth } from '../hooks/useAuth.js'

export default function TicketDetail() {
  return (
    <AuthProvider>
      <TicketInner />
    </AuthProvider>
  )
}

function TicketInner() {
  const { id } = useParams()
  const { token } = useAuth()
  const [data, setData] = React.useState(null)
  const [audit, setAudit] = React.useState([])
  React.useEffect(()=>{
    api(`/api/tickets/${id}`, { token }).then(setData).catch(console.error)
    api(`/api/tickets/${id}/audit`, { token }).then(setAudit).catch(console.error)
  }, [id])
  if (!data) return <p>Loading...</p>
  const { ticket, suggestion } = data
  return (
    <div style={{display:'grid', gap:12}}>
      <h2>{ticket.title}</h2>
      <p><b>Status:</b> {ticket.status}</p>
      {suggestion && (
        <div style={{border:'1px solid #ddd', padding:12}}>
          <h3>Agent Suggestion</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{suggestion.draftReply}</pre>
          <p><b>Category:</b> {suggestion.predictedCategory} &nbsp; <b>Confidence:</b> {suggestion.confidence.toFixed(2)}</p>
        </div>
      )}
      <div>
        <h3>Audit Timeline</h3>
        <ol>
          {audit.map(a => (
            <li key={a._id}>{a.timestamp} — <b>{a.action}</b> — {a.actor}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
