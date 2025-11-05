import { useState } from 'react'
import { api } from '../api.ts'
import { Box, Metrics } from '../types.ts'

interface Props {
  onComplete: (sessionId: string, imageSrc: string, boxes: Box[], metrics: Metrics) => void
}

export default function Upload({ onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // upload
      const uploadRes = await api.upload(file)
      const sessionId = uploadRes.session_id

      // run inference
      const inferRes = await api.infer(sessionId)

      // load image for preview
      const reader = new FileReader()
      reader.onload = () => {
        onComplete(sessionId, reader.result as string, inferRes.boxes, inferRes.metrics)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Image</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose an image (max 10MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {file && (
          <div className="mb-4 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Upload & Detect'}
        </button>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        <p>• Supports JPEG, PNG, WebP</p>
        <p>• Auto-detects objects with YOLOv8</p>
        <p>• Edit boxes before export</p>
      </div>
    </div>
  )
}
