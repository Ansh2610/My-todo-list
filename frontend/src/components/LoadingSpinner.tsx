import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  submessage?: string
  progress?: number
}

export default function LoadingSpinner({ message = 'Processing...', submessage, progress }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinning loader icon */}
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          
          {/* Main message */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            {message}
          </h3>
          
          {/* Submessage */}
          {submessage && (
            <p className="text-sm text-gray-600 mb-4 text-center">
              {submessage}
            </p>
          )}
          
          {/* Progress bar if provided */}
          {progress !== undefined && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Pulsing dots animation */}
          <div className="flex gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
