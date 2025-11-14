import { Box } from '../types.ts'

interface ImageHistory {
  id: string
  imageSrc: string
  boxes: Box[]
  timestamp: Date
  filename: string
}

interface Props {
  images: ImageHistory[]
  onSelectImage: (index: number) => void
  onDeleteImage?: (index: number) => void
  currentIndex: number | null
}

export default function Gallery({ images, onSelectImage, onDeleteImage, currentIndex }: Props) {
  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation() // Prevent triggering onSelectImage
    if (confirm('Delete this image from the gallery?')) {
      onDeleteImage?.(index)
    }
  }

  if (images.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-gray-400 text-6xl mb-4">🖼️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Images Yet</h2>
        <p className="text-gray-500">Upload images to see them here</p>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Image Gallery ({images.length})</h2>
      <p className="text-sm text-gray-600 mb-6">
        Click any image to view and edit its annotations
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectImage(index)}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
              currentIndex === index
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100">
              <img
                src={item.imageSrc}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-xs font-semibold truncate">{item.filename}</p>
                <p className="text-xs opacity-80">{formatTime(item.timestamp)}</p>
                <p className="text-xs opacity-80">{item.boxes.length} detection{item.boxes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Current indicator */}
            {currentIndex === index && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                CURRENT
              </div>
            )}

            {/* Delete button */}
            {onDeleteImage && (
              <button
                onClick={(e) => handleDelete(e, index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete image"
              >
                🗑️
              </button>
            )}

            {/* Image number badge */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
              #{index + 1}
            </div>

            {/* Box count badge */}
            {item.boxes.length > 0 && (
              <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                {item.boxes.length} 📦
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{images.length}</div>
          <div className="text-xs text-gray-600">Total Images</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {images.reduce((sum, img) => sum + img.boxes.length, 0)}
          </div>
          <div className="text-xs text-gray-600">Total Detections</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(images.reduce((sum, img) => sum + img.boxes.length, 0) / images.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Avg per Image</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
        💡 <strong>Tip:</strong> Click any image to load it in the editor and make changes to annotations
      </div>
    </div>
  )
}
