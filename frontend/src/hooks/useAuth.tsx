import React from 'react'
import { apiAuth } from '../services/api'

type AuthUser = {
  id: number | null
  email: string
  username: string
  token: string
  profile_picture?: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const STORAGE_KEY = 'recette_user'

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const token = typeof parsed.token === 'string' ? parsed.token : null
    const email = typeof parsed.email === 'string' ? parsed.email : null
    if (!token || !email) return null

    let id: number | null = null
    if (typeof parsed.id === 'number' && Number.isFinite(parsed.id) && parsed.id > 0) {
      id = parsed.id
    } else if (parsed.id !== null && parsed.id !== undefined) {
      const coerced = Number(parsed.id)
      if (Number.isInteger(coerced) && coerced > 0) {
        id = coerced
      }
    }

    const username =
      typeof parsed.username === 'string' && parsed.username.trim().length > 0
        ? parsed.username
        : ''

    const profile_picture =
      typeof parsed.profile_picture === 'string' && parsed.profile_picture.length > 0
        ? parsed.profile_picture
        : null

    return {
      id,
      email,
      username,
      token,
      profile_picture,
    }
  } catch {
    return null
  }
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(() => readStoredUser())

  const logout = React.useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = React.useCallback((value: AuthUser) => {
    const normalized: AuthUser = {
      id: value.id ?? null,
      email: value.email,
      username: value.username?.trim() || value.email,
      token: value.token,
      profile_picture: value.profile_picture ?? null,
    }
    setUser(normalized)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  }, [])

  React.useEffect(() => {
    if (!user) return
    if (user.id !== null && user.username) return

    let cancelled = false
    apiAuth(user.token)
      .get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return
        const enriched: AuthUser = {
          id: typeof data.id === 'number' ? data.id : Number(data.id) || null,
          email: data.email ?? user.email,
          username: data.username ?? user.username ?? user.email,
          token: user.token,
          profile_picture: data.profile_picture ?? null,
        }
        setUser(enriched)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched))
      })
      .catch(() => {
        if (!cancelled) {
          logout()
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, logout])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
