export interface Box {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  label: string
  class_id: number
  box_id?: string
  is_verified?: boolean
  is_correct?: boolean
  is_manual?: boolean
}

export interface Metrics {
  fps: number
  avg_confidence: number
  false_positive_rate: number
  box_count: number
}

export interface TrueMetrics {
  precision: number
  recall: number
  f1_score: number
  true_positives: number
  false_positives: number
  false_negatives: number
  total_verified: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
