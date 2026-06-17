import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('ozyshield_token'))

  useEffect(() => {
    api.get('/config')
      .then(setConfig)
      .catch(() => setConfig({ registration_enabled: true, default_role: 'member' }))
  }, [])

  useEffect(() => {
    if (token) {
      api.get('/users/me')
        .then(setUser)
        .catch(() => {
          setUser(null)
          setToken(null)
          localStorage.removeItem('ozyshield_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem('ozyshield_token', res.token)
    return res.user
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ozyshield_token')
  }, [])

  const switchUser = useCallback(async (userId) => {
    const u = await api.post('/users/switch', { user_id: userId })
    setUser(u)
    return u
  }, [])

  const isAdmin = user?.role === 'admin'

  const canEdit = useCallback((resource) => {
    if (isAdmin) return true
    if (resource?.team_id && user?.teams?.includes(resource.team_id)) return true
    return false
  }, [isAdmin, user])

  return (
    <AuthContext.Provider value={{ user, config, loading, token, login, logout, switchUser, isAdmin, canEdit }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
