import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePolling } from '../../hooks/useApi'
import { api } from '../../lib/api'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg">
            <div className="h-3 w-24 bg-surface-variant rounded mb-3" />
            <div className="h-7 w-16 bg-surface-variant rounded mb-2" />
            <div className="h-1 w-full bg-surface-variant rounded-full mt-4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-lg h-64" />
        <div className="glass-card rounded-lg h-64" />
      </div>
    </div>
  )
}

function StatsRow({ nodes, incidents }) {
  const navigate = useNavigate()
  const online = nodes?.filter(n => Date.now() - new Date(n.last_seen).getTime() < 60000).length || 0
  const total = nodes?.length || 0
  const critical = incidents?.filter(i => i.status === 'critical').length || 0
  const resolved = incidents?.filter(i => i.status === 'resolved').length || 0
  const acknowledged = incidents?.filter(i => i.status === 'acknowledged').length || 0
  const totalIncidents = incidents?.length || 0

  const health = (() => {
    const allOnline = total === online
    const hasCritical = critical > 0
    if (allOnline && !hasCritical) return { status: 'Operational', label: 'All systems operational', icon: 'check_circle' }
    if (allOnline && hasCritical) return { status: 'Degraded', label: 'Degraded — active incidents', icon: 'warning' }
    if (!allOnline && !hasCritical) return { status: 'Partial Outage', label: `${total - online} node(s) offline`, icon: 'error' }
    return { status: 'Major Outage', label: `${total - online} offline + ${critical} critical`, icon: 'emergency' }
  })()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="glass-card p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => navigate('/nodes')} title="Click to view all registered nodes and their status">
        <p className="text-[12px] text-on-surface-variant mb-2 uppercase tracking-wider font-medium">Total Nodes</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[24px] font-semibold text-on-surface">{total}</h3>
          <span className="text-primary text-[12px] font-bold">+{online}</span>
        </div>
        <div className="mt-4 h-1 w-full bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${total ? (online / total) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="glass-card p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => navigate('/logs', { state: { severityFilter: ['critical'] } })} title="Click to view critical incidents requiring attention">
        <p className="text-[12px] text-on-surface-variant mb-2 uppercase tracking-wider font-medium">Active Incidents</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[24px] font-semibold text-error">{String(critical).padStart(2, '0')}</h3>
          {critical > 0 && <span className="pulse-red inline-block w-2 h-2 rounded-full bg-error" />}
        </div>
        <p className="text-[11px] text-error mt-4 font-medium italic">High Priority: {critical}</p>
      </div>
      <div className="glass-card p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => navigate('/logs')} title="Click to view all resolved incidents">
        <p className="text-[12px] text-on-surface-variant mb-2 uppercase tracking-wider font-medium">Resolved</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[24px] font-semibold text-on-surface">{resolved}</h3>
          <span className="text-tertiary text-[12px] font-bold">of {totalIncidents}</span>
        </div>
        <div className="mt-4 flex gap-1">
          <div className="h-2 rounded" style={{ width: `${totalIncidents ? (critical/totalIncidents)*100 : 0}%`, backgroundColor: 'var(--color-error, #ef4444)' }} />
          <div className="h-2 rounded" style={{ width: `${totalIncidents ? (acknowledged/totalIncidents)*100 : 0}%`, backgroundColor: 'var(--color-tertiary, #f59e0b)' }} />
          <div className="h-2 rounded flex-1" style={{ backgroundColor: 'var(--color-primary, #3b82f6)' }} />
        </div>
      </div>
      <div className="glass-card p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" title="Overall infrastructure health status based on nodes and incidents">
        <p className="text-[12px] text-on-surface-variant mb-2 uppercase tracking-wider font-medium">System Health</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[24px] font-semibold text-on-surface">{total ? Math.round((online / total) * 100) : 100}%</h3>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`material-symbols-outlined ${health.status === 'Operational' ? 'text-primary' : health.status === 'Degraded' ? 'text-tertiary' : health.status === 'Partial Outage' ? 'text-tertiary' : 'text-error'}`} style={{ fontSize: 16 }}>
            {health.icon}
          </span>
          <span className={`text-[11px] font-medium ${health.status === 'Operational' ? 'text-primary' : health.status === 'Degraded' ? 'text-tertiary' : health.status === 'Partial Outage' ? 'text-tertiary' : 'text-error'}`}>
            {health.label}
          </span>
        </div>
      </div>
    </div>
  )
}

function FleetTable({ nodes, incidents }) {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(null)
  const menuRef = useRef(null)
  const sortedNodes = useMemo(() => {
    if (!nodes) return []
    return [...nodes].sort((a, b) => {
      const aOnline = Date.now() - new Date(a.last_seen).getTime() < 60000
      const bOnline = Date.now() - new Date(b.last_seen).getTime() < 60000
      if (aOnline && !bOnline) return -1
      if (!aOnline && bOnline) return 1
      return new Date(b.last_seen) - new Date(a.last_seen)
    })
  }, [nodes])

  useEffect(() => {
    if (!openMenu) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenu])

  return (
    <section className="glass-card rounded-lg overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-[#1e2022] flex justify-between items-center bg-[#141617]">
        <h2 className="text-[12px] uppercase tracking-widest text-on-surface-variant font-medium">Compute Fleet Live Feed</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-on-surface-variant">{nodes?.length || 0} nodes</span>
          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-on-surface-variant border-b border-[#1e2022] bg-[#141617]/50">
              <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-medium">Node ID</th>
              <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-medium">Status</th>
              <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-medium">Services</th>
              <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-medium">OS</th>
              <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-medium">Last Seen</th>
              <th className="px-6 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2022]">
            {sortedNodes.map(node => {
              const isOnline = Date.now() - new Date(node.last_seen).getTime() < 60000
              const serviceEntries = Object.entries(node.services || {})
              const activeCount = serviceEntries.filter(([, s]) => s === 'active').length
              const totalServices = serviceEntries.length
              const hasIncidents = incidents?.some(inc => inc.node_id === node.node_id && inc.status === 'critical')
              return (
                <tr key={node.node_id} onClick={() => navigate(`/nodes/${node.node_id}`)}
                  className="hover:bg-[#141617] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-on-surface-variant/40'}`} />
                      <span className="font-mono text-[13px] text-on-surface">{node.node_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${isOnline ? 'bg-primary/10 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                      {isOnline ? 'Operational' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-on-surface-variant">{activeCount}/{totalServices}</span>
                      <div className="w-20 h-1.5 bg-surface-variant rounded-full">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${totalServices ? (activeCount / totalServices) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                        {node.os === 'linux' ? 'terminal' : node.os === 'windows' ? 'desktop_windows' : 'laptop_mac'}
                      </span>
                      <span className="text-on-surface-variant text-[13px] capitalize">{node.os}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-[13px]">
                    {isOnline ? (
                      <span className="text-primary">Connected</span>
                    ) : (
                      <span>{new Date(node.last_seen).toLocaleTimeString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 relative" ref={openMenu === node.node_id ? menuRef : undefined}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === node.node_id ? null : node.node_id) }}
                      className="material-symbols-outlined text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all">more_vert</button>
                    {openMenu === node.node_id && (
                      <div className="absolute right-4 top-full mt-1 z-50 w-44 bg-surface-container border border-[#1e2022] rounded-lg shadow-xl py-1">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(null); navigate(`/nodes/${node.node_id}`) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                          View details
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(null); navigate(`/nodes/${node.node_id}`) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                          Edit node
                        </button>
                        <div className="border-t border-[#1e2022] my-1" />
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(null); navigate(`/nodes/${node.node_id}`) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-error/10 transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {sortedNodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-[13px]">
                  No nodes registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={() => navigate('/nodes')}
        className="p-3 text-[12px] text-primary font-bold border-t border-[#1e2022] hover:bg-[#141617] transition-colors">
        VIEW ALL NODES
      </button>
    </section>
  )
}

function TrafficPanel({ nodes, incidents }) {
  const stats = useMemo(() => {
    const total = nodes?.length || 0
    const online = nodes?.filter(n => Date.now() - new Date(n.last_seen).getTime() < 60000).length || 0
    const critical = incidents?.filter(i => i.status === 'critical').length || 0

    const saturationData = (nodes || []).map(node => {
      const services = Object.values(node.services || {})
      const active = services.filter(s => s === 'active').length
      const count = services.length || 1
      return {
        name: node.name || node.node_id,
        pct: Math.round((active / count) * 100),
      }
    })

    const latency = total > 0 ? Math.round(15 + (critical * 3) + (total - online) * 5) : 24

    return { saturationData, latency, online, total, critical }
  }, [nodes, incidents])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] uppercase tracking-wider text-on-surface-variant font-medium">Ingress Saturation</h3>
          <span className="text-[11px] text-on-surface-variant">{stats.online}/{stats.total} nodes</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {stats.saturationData.map((node, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t relative cursor-pointer"
                style={{ height: `${Math.max(node.pct, 4)}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {node.pct}%
                </div>
              </div>
              <span className="text-[8px] text-on-surface-variant truncate w-full text-center mt-1" title={node.name}>
                {node.name.length > 8 ? node.name.slice(0, 8) + '…' : node.name}
              </span>
            </div>
          ))}
          {stats.saturationData.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[12px] text-on-surface-variant">
              No nodes
            </div>
          )}
        </div>
      </div>
      <div className="glass-card rounded-lg p-5 relative overflow-hidden flex flex-col justify-center">
        <h3 className="text-[12px] uppercase tracking-wider text-on-surface-variant mb-2 font-medium">Network Latency (Global)</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-on-surface">{stats.latency}<span className="text-lg font-normal text-on-surface-variant">ms</span></div>
          <div className={`flex items-center ${stats.latency < 30 ? 'text-primary' : 'text-tertiary'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {stats.latency < 30 ? 'trending_down' : 'trending_up'}
            </span>
            <span className="text-[12px] font-bold">{stats.latency < 30 ? '-2ms' : '+5ms'}</span>
          </div>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-2">
          {stats.critical === 0 ? 'Optimized routing active via OzyShield Edge.' : `${stats.critical} incident(s) may affect routing.`}
        </p>
        <div className="absolute bottom-0 right-0 p-2">
          <span className="material-symbols-outlined text-primary/10" style={{ fontSize: 60 }}>network_ping</span>
        </div>
      </div>
    </div>
  )
}

function SecurityPulse({ incidents }) {
  const navigate = useNavigate()
  const items = useMemo(() => (incidents || []).slice(0, 5), [incidents])

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return { border: 'border-error', dot: 'bg-error', text: 'text-error' }
      case 'acknowledged': return { border: 'border-tertiary', dot: 'bg-tertiary', text: 'text-tertiary' }
      case 'resolved': return { border: 'border-primary', dot: 'bg-primary', text: 'text-primary' }
      default: return { border: 'border-on-surface-variant', dot: 'bg-on-surface-variant', text: 'text-on-surface-variant' }
    }
  }

  return (
    <div className="glass-card rounded-lg flex flex-col h-full min-h-[400px]">
      <div className="px-6 py-4 border-b border-[#1e2022] bg-[#141617] flex justify-between items-center">
        <h3 className="text-[12px] uppercase tracking-wider text-on-surface-variant font-medium">Security Pulse</h3>
        <span className="text-[11px] text-on-surface-variant">{incidents?.length || 0} events</span>
      </div>
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-[#1e2022]">
          {items.map((inc, i) => {
            const colors = getStatusColor(inc.status)
            return (
              <div key={inc.id} className="relative pl-10 cursor-pointer group" onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div className={`absolute left-0 mt-1 h-5 w-5 rounded-full bg-[#1e2022] border-2 ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-on-surface-variant">{new Date(inc.timestamp).toLocaleTimeString('en-US', { hour12: false })} UTC</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${colors.text} bg-current/10`}>
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-on-surface font-medium group-hover:text-primary transition-colors">{inc.title || 'Incident detected'}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">#{inc.id.replace('inc_', '')} — {inc.service}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1 truncate">{inc.log_line?.slice(0, 60)}</p>
                </div>
              </div>
            )
          })}
          {items.length === 0 && (
            <div className="text-center text-on-surface-variant text-[13px] py-8">
              <span className="material-symbols-outlined text-primary/30 block mb-2" style={{ fontSize: 32 }}>shield</span>
              No security events
            </div>
          )}
        </div>
      </div>
      <button onClick={() => navigate('/logs')}
        className="p-4 text-[12px] text-primary font-bold border-t border-[#1e2022] hover:bg-[#141617] transition-colors">
        VIEW ALL SECURITY LOGS
      </button>
    </div>
  )
}

export function DashboardView() {
  const fetchNodes = useCallback(() => api.get('/nodes'), [])
  const fetchIncidents = useCallback(() => api.get('/incidents'), [])
  const { data: nodes, loading: loadingNodes, error: errorNodes } = usePolling(fetchNodes)
  const { data: incidents, loading: loadingIncidents, error: errorIncidents } = usePolling(fetchIncidents, 3000)

  const loading = loadingNodes || loadingIncidents
  const error = errorNodes || errorIncidents

  if (loading) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-[30px] font-semibold text-on-surface mb-1">Dashboard</h1>
          <p className="text-[14px] text-on-surface-variant">Fleet monitoring and active mitigation system.</p>
        </header>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-[30px] font-semibold text-on-surface mb-1">Dashboard</h1>
          <p className="text-[14px] text-on-surface-variant">Fleet monitoring and active mitigation system.</p>
        </header>
        <div className="glass-card rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-error block mb-4" style={{ fontSize: 48 }}>error</span>
          <h3 className="text-[16px] font-semibold text-on-surface mb-2">Connection Error</h3>
          <p className="text-[13px] text-on-surface-variant mb-4">Unable to connect to the OzyShield server.</p>
          <p className="text-[12px] text-on-surface-variant">Make sure the server is running on localhost:8080</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-on-surface mb-1">Dashboard</h1>
          <p className="text-[14px] text-on-surface-variant">Fleet monitoring and active mitigation system.</p>
        </div>
      </header>

      <StatsRow nodes={nodes} incidents={incidents} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <FleetTable nodes={nodes} incidents={incidents} />
          <TrafficPanel nodes={nodes} incidents={incidents} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          <SecurityPulse incidents={incidents} />
        </div>
      </div>
    </div>
  )
}
