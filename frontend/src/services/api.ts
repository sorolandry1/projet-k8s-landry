import axios from 'axios'

const resolveBaseURL = () => {
  const raw = import.meta.env.VITE_API_URL?.trim()
  const windowAvailable = typeof window !== 'undefined'
  const inferFromWindow = () => {
    if (!windowAvailable) return 'http://localhost:8000'
    const { protocol, hostname } = window.location
    const port = hostname === 'localhost' || hostname === '127.0.0.1' ? '8000' : window.location.port
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`
  }

  if (!raw) {
    return inferFromWindow()
  }

  try {
    const parsed = new URL(raw)
    // Handle Docker-only hostnames such as "backend"
    if (
      windowAvailable &&
      parsed.hostname === 'backend' &&
      window.location.hostname !== 'backend'
    ) {
      return `${parsed.protocol}//${window.location.hostname}:${parsed.port || '8000'}`
    }
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return inferFromWindow()
  }
}

export const baseURL = resolveBaseURL()

const joinUrl = (root: string, path: string) => {
  const normalizedRoot = root.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return `${normalizedRoot}/${normalizedPath}`
}

export const resolveAssetUrl = (value?: string | null): string => {
  if (!value) return ''
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value

  const trimmed = value.replace(/^\/+/, '')
  const normalized = trimmed.startsWith('uploads/')
    ? trimmed
    : `uploads/${trimmed}`

  return joinUrl(baseURL, normalized)
}

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`
})

export const apiAuth = (token?: string) =>
  axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
