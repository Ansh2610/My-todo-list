export interface Box {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  label: string
  class_id: number
}

export interface Metrics {
  fps: number
  avg_confidence: number
  false_positive_rate: number
  box_count: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
