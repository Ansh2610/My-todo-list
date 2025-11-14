import { Box } from '../types'
import { useState, useEffect, useRef } from 'react'
import { Check, X, Trash2 } from 'lucide-react'

interface Props {
  boxes: Box[]
  imageSrc: string
  selectedBoxIndex: number | null
  onSelectBox: (index: number) => void
  onVerifyBox: (index: number, isCorrect: boolean) => void
  onDeleteBox: (index: number) => void
}

export default function DetectedObjectsPanel({ 
  boxes, 
  imageSrc,
  selectedBoxIndex,
  onSelectBox,
  onVerifyBox,
  onDeleteBox
}: Props) {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      generateThumbnails()
    }
    img.src = imageSrc
  }, [imageSrc, boxes])

  const generateThumbnails = () => {
    if (!imgRef.current) return

    const newThumbnails = boxes.map(box => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return ''

        const width = Math.max(box.x2 - box.x1, 1)
        const height = Math.max(box.y2 - box.y1, 1)
        
        canvas.width = width
        canvas.height = height

        ctx.drawImage(
          imgRef.current!,
          box.x1, box.y1, width, height,
          0, 0, width, height
        )

        return canvas.toDataURL()
      } catch (err) {
        console.error('Error cropping image:', err)
        return ''
      }
    })

    setThumbnails(newThumbnails)
  }

  return (
    <div className="bg-white border-t-2 border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Detected Objects ({boxes.length})
      </h3>
      
      {boxes.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No objects detected. Use "Draw Box" to add annotations.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {boxes.map((box, idx) => (
            <div
              key={idx}
              onClick={() => onSelectBox(idx)}
              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition ${
                selectedBoxIndex === idx
                  ? 'border-blue-500 shadow-lg'
                  : box.is_verified
                    ? box.is_correct
                      ? 'border-green-300'
                      : 'border-red-300'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {/* Thumbnail */}
              <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                {thumbnails[idx] ? (
                  <img 
                    src={thumbnails[idx]} 
                    alt={box.label}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-gray-400">Loading...</div>
                )}
              </div>
              
              {/* Info & Actions */}
              <div className="p-2 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium truncate flex-1">
                    {box.label}
                    {box.is_manual && <span className="ml-1 text-purple-600">*</span>}
                  </span>
                </div>
                
                {/* Verification Buttons */}
                {!box.is_manual && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onVerifyBox(idx, true)
                      }}
                      className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition flex items-center justify-center ${
                        box.is_verified && box.is_correct
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onVerifyBox(idx, false)
                      }}
                      className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition flex items-center justify-center ${
                        box.is_verified && !box.is_correct
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteBox(idx)
                      }}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {box.is_manual && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteBox(idx)
                    }}
                    className="w-full px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
