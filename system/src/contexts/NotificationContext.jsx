import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { api } from '../lib/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState('default')
  const lastIncidentCount = useRef(0)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied'
    const p = await Notification.requestPermission()
    setPermission(p)
    return p
  }, [])

  const addNotification = useCallback((notif) => {
    const entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    }
    setNotifications(prev => [entry, ...prev].slice(0, 50))
    return entry
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showDesktopNotification = useCallback((title, body, icon = '🛡️') => {
    if (permission !== 'granted') return
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ozyshield-' + Date.now(),
        requireInteraction: true,
      })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch (e) {
      console.warn('Desktop notification failed:', e)
    }
  }, [permission])

  // Poll for new incidents and trigger notifications
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const incidents = await api.get('/incidents')
        const criticalNew = incidents.filter(i => i.status === 'critical')
        if (lastIncidentCount.current > 0 && criticalNew.length > lastIncidentCount.current) {
          const diff = criticalNew.length - lastIncidentCount.current
          const title = `🚨 ${diff} New Critical Incident${diff > 1 ? 's' : ''}`
          const body = criticalNew.slice(0, 3).map(i => `${i.node_id}: ${i.service}`).join('\n')
          addNotification({ type: 'incident', title, body, severity: 'critical' })
          showDesktopNotification(title, body)
        }
        lastIncidentCount.current = criticalNew.length
      } catch (e) { /* silent */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [addNotification, showDesktopNotification])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, permission, showPanel, setShowPanel,
      requestPermission, addNotification, markAsRead, markAllRead, clearAll,
      showDesktopNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
