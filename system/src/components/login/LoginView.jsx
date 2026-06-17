import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      window.location.href = '/'
    } catch (err) {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">OzyShield</h1>
            <p className="text-[12px] text-on-surface-variant">Zero-Trust Security Monitor</p>
          </div>
        </div>

        <div className="bg-surface-container border border-[#1e2022] rounded-xl p-6">
          <h2 className="text-[16px] font-semibold text-on-surface mb-1">Sign in</h2>
          <p className="text-[12px] text-on-surface-variant mb-5">Enter your credentials to access the dashboard</p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-[12px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-on-surface-variant font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-[#1e2022] text-on-surface rounded-lg px-3 py-2.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="admin@ozyshield.local"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-on-surface-variant font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-[#1e2022] text-on-surface rounded-lg px-3 py-2.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-medium py-2.5 rounded-lg text-[13px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-on-surface-variant/50 mt-5">
          OzyShield v1.0 &middot; Zero-Trust Security Monitoring
        </p>
      </div>
    </div>
  )
}
