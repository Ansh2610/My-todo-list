import { useRef, useEffect, useState } from 'react'
import { api } from '../api.ts'
import { Box } from '../types.ts'

interface Props {
  sessionId: string
  imageSrc: string
  initialBoxes: Box[]
}

export default function Canvas({ sessionId, imageSrc, initialBoxes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes)
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      setImgDims({ width: img.width, height: img.height })
      drawCanvas(img)
    }
  }, [imageSrc])

  useEffect(() => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => drawCanvas(img)
  }, [boxes])

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // fit to container (max 800px wide)
    const maxWidth = 800
    const scale = Math.min(1, maxWidth / img.width)
    const w = img.width * scale
    const h = img.height * scale

    canvas.width = w
    canvas.height = h

    ctx.drawImage(img, 0, 0, w, h)

    // draw boxes
    boxes.forEach((box) => {
      const x1 = (box.x1 / img.width) * w
      const y1 = (box.y1 / img.height) * h
      const x2 = (box.x2 / img.width) * w
      const y2 = (box.y2 / img.height) * h

      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

      // label
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(x1, y1 - 20, 100, 20)
      ctx.fillStyle = '#000'
      ctx.font = '12px sans-serif'
      ctx.fillText(`${box.label} ${(box.confidence * 100).toFixed(0)}%`, x1 + 2, y1 - 5)
    })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await api.export(sessionId, boxes, imgDims.width, imgDims.height)
      
      // download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sessionId}.zip`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = (idx: number) => {
    setBoxes(boxes.filter((_, i) => i !== idx))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Labels ({boxes.length} boxes)</h2>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {exporting ? 'Exporting...' : 'Export YOLO Format'}
        </button>
      </div>

      <div className="mb-4">
        <canvas ref={canvasRef} className="border border-gray-300 max-w-full" />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Detected Objects:</h3>
        {boxes.map((box, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>
              {box.label} ({(box.confidence * 100).toFixed(1)}%)
            </span>
            <button
              onClick={() => handleDelete(idx)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
