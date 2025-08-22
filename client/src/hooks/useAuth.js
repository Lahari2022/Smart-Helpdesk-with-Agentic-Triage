import React from 'react'
const Ctx = React.createContext(null)

export function useAuth() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useAuth outside provider')
  return v
}

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(localStorage.getItem('token'))
  const [user, setUser] = React.useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  function login(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token); setUser(user)
  }
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null); setUser(null)
  }
  return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>
}
