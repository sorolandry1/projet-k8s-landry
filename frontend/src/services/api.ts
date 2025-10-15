import axios from 'axios'

const resolveBaseURL = () => {
  const rawValues =
    import.meta.env.VITE_API_URL
      ?.split(',')
      .map(value => value.trim())
      .filter(Boolean) ?? []
  const raw = rawValues[0]
  const windowAvailable = typeof window !== 'undefined'
  const inferFromWindow = () => {
    if (!windowAvailable) return 'http://localhost:8000'
    const { protocol, hostname } = window.location
    const port =
      hostname === 'localhost' || hostname === '127.0.0.1'
        ? '8000'
        : window.location.port
    const devServerPorts = new Set(['5173', '5174', '5175', '5176', '5177', '5178', '5179'])
    const resolvedPort = port && devServerPorts.has(port) ? '8000' : port
    return `${protocol}//${hostname}${resolvedPort ? `:${resolvedPort}` : ''}`
  }

  if (raw) {
    for (const candidate of rawValues) {
      try {
        const parsed = new URL(candidate)
        const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname)
        if (
          windowAvailable &&
          isLocalHost &&
          !['localhost', '127.0.0.1'].includes(window.location.hostname)
        ) {
          continue
        }
        if (
          windowAvailable &&
          parsed.hostname === 'backend' &&
          window.location.hostname !== 'backend'
        ) {
          return `${parsed.protocol}//${window.location.hostname}:${parsed.port || '8000'}`
        }
        return parsed.toString().replace(/\/$/, '')
      } catch {
        continue
      }
    }
  }

  return inferFromWindow()
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
