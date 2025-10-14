import React from 'react'

type User = { email: string, token: string }

const AuthContext = React.createContext<{
  user: User | null,
  login: (u: User) => void,
  logout: () => void
} | null>(null)

export const AuthProvider = ({children}:{children: React.ReactNode}) => {
  const [user, setUser] = React.useState<User | null>(() => {
    const raw = localStorage.getItem('recette_user')
    return raw ? JSON.parse(raw) : null
  })
  const login = (u: User) => {
    setUser(u)
    localStorage.setItem('recette_user', JSON.stringify(u))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('recette_user')
  }
  return <AuthContext.Provider value={{user, login, logout}}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
