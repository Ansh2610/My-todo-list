const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001'

export const api = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Upload failed')
    }

    return res.json()
  },

  infer: async (sessionId: string) => {
    const res = await fetch(`${API_URL}/api/infer/${sessionId}`, {
      method: 'POST',
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Inference failed')
    }

    return res.json()
  },

  export: async (sessionId: string, boxes: any[], width: number, height: number) => {
    const res = await fetch(`${API_URL}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        boxes,
        image_width: width,
        image_height: height,
      }),
    })

    if (!res.ok) {
      throw new Error('Export failed')
    }

    return res.blob()
  },

  connectMetrics: (sessionId: string) => {
    return new WebSocket(`${WS_URL}/ws/metrics/${sessionId}`)
  },
}
