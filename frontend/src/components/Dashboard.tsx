import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { api } from '../api.ts'
import { Metrics } from '../types.ts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  sessionId: string
  initialMetrics: Metrics | null
}

export default function Dashboard({ sessionId, initialMetrics }: Props) {
  const [metrics, setMetrics] = useState<Metrics[]>(initialMetrics ? [initialMetrics] : [])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // connect to websocket
    const socket = api.connectMetrics(sessionId)

    socket.onopen = () => {
      setConnected(true)
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'metrics') {
        setMetrics((prev) => [...prev, msg.data])
      }
    }

    socket.onerror = () => {
      setConnected(false)
    }

    socket.onclose = () => {
      setConnected(false)
    }

    return () => {
      socket.close()
    }
  }, [sessionId])

  const labels = metrics.map((_, i) => `T+${i}`)

  const fpsData = {
    labels,
    datasets: [
      {
        label: 'FPS',
        data: metrics.map((m) => m.fps),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  }

  const confData = {
    labels,
    datasets: [
      {
        label: 'Avg Confidence',
        data: metrics.map((m) => m.avg_confidence),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
      },
    ],
  }

  const fpData = {
    labels,
    datasets: [
      {
        label: 'False Positive Rate (%)',
        data: metrics.map((m) => m.false_positive_rate),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const latestMetrics = metrics[metrics.length - 1] || initialMetrics

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Live Metrics</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {latestMetrics && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">FPS</div>
            <div className="text-2xl font-bold">{latestMetrics.fps.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Avg Confidence</div>
            <div className="text-2xl font-bold">{latestMetrics.avg_confidence.toFixed(3)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">False Positive Rate</div>
            <div className="text-2xl font-bold">{latestMetrics.false_positive_rate.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Boxes</div>
            <div className="text-2xl font-bold">{latestMetrics.box_count}</div>
          </div>
        </div>
      )}

      {metrics.length > 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">FPS Over Time</h3>
            <Line options={options} data={fpsData} />
          </div>
          <div>
            <h3 className="font-medium mb-2">Confidence Over Time</h3>
            <Line options={options} data={confData} />
          </div>
          <div>
            <h3 className="font-medium mb-2">False Positive Rate Over Time</h3>
            <Line options={options} data={fpData} />
          </div>
        </div>
      )}

      {metrics.length === 1 && (
        <div className="text-sm text-gray-600 mt-4">
          Run multiple inferences to see trends over time.
        </div>
      )}
    </div>
  )
}
