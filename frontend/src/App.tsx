import { useState } from 'react'
import Upload from './components/Upload.tsx'
import Canvas from './components/Canvas.tsx'
import Dashboard from './components/Dashboard.tsx'
import { Box, Metrics } from './types.ts'

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'metrics'>('editor')

  const handleUploadComplete = (session: string, src: string, detectedBoxes: Box[], m: Metrics) => {
    setSessionId(session)
    setImageSrc(src)
    setBoxes(detectedBoxes)
    setMetrics(m)
  }

  const handleReset = () => {
    setSessionId(null)
    setImageSrc(null)
    setBoxes([])
    setMetrics(null)
    setActiveTab('editor')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">VisionPulse</h1>
          <p className="text-sm text-gray-600 mt-1">AI-assisted image labeling</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!sessionId ? (
          <Upload onComplete={handleUploadComplete} />
        ) : (
          <div>
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2 rounded ${activeTab === 'metrics' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Metrics
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded bg-red-500 text-white ml-auto"
              >
                Reset
              </button>
            </div>

            {activeTab === 'editor' ? (
              <Canvas
                sessionId={sessionId}
                imageSrc={imageSrc!}
                initialBoxes={boxes}
              />
            ) : (
              <Dashboard sessionId={sessionId} initialMetrics={metrics} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
