// Runtime configuration - works in both dev and production
const getApiUrl = (): string => {
  // In production, use the production backend
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://visionpulse-backend.onrender.com'
  }
  
  // In development, use environment variable or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

const getWsUrl = (): string => {
  // In production, use secure WebSocket
  if (window.location.hostname.includes('vercel.app')) {
    return 'wss://visionpulse-backend.onrender.com'
  }
  
  // In development, use environment variable or localhost
  return import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
}

export const API_URL = getApiUrl()
export const WS_URL = getWsUrl()

console.log('🔧 Config loaded:', { API_URL, WS_URL, hostname: window.location.hostname })
