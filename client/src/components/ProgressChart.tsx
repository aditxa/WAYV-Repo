import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ProgressData {
  timestamp: number
  accuracy: number
  latency: number
  attempts: number
  mode: "learning" | "practice"
}

interface ProgressChartProps {
  data?: ProgressData[]
  className?: string
}

export default function ProgressChart({ data = [], className }: ProgressChartProps) {
  
  // TODO: Remove mock functionality - replace with real data from storage
  const mockData: ProgressData[] = [
    { timestamp: Date.now() - 300000, accuracy: 65, latency: 2400, attempts: 12, mode: "learning" },
    { timestamp: Date.now() - 240000, accuracy: 72, latency: 2100, attempts: 15, mode: "learning" },
    { timestamp: Date.now() - 180000, accuracy: 78, latency: 1900, attempts: 18, mode: "learning" },
    { timestamp: Date.now() - 120000, accuracy: 85, latency: 1700, attempts: 22, mode: "practice" },
    { timestamp: Date.now() - 60000, accuracy: 91, latency: 1500, attempts: 25, mode: "practice" },
  ]

  const currentData = data.length > 0 ? data : mockData
  
  const calculateStats = () => {
    if (currentData.length === 0) return null
    
    const latest = currentData[currentData.length - 1]
    const previous = currentData.length > 1 ? currentData[currentData.length - 2] : null
    
    const avgAccuracy = currentData.reduce((sum, d) => sum + d.accuracy, 0) / currentData.length
    const avgLatency = currentData.reduce((sum, d) => sum + d.latency, 0) / currentData.length
    const totalAttempts = currentData.reduce((sum, d) => sum + d.attempts, 0)
    
    const accuracyTrend = previous ? latest.accuracy - previous.accuracy : 0
    const latencyTrend = previous ? previous.latency - latest.latency : 0 // Positive when improving (lower latency)
    
    return {
      current: latest,
      averages: { accuracy: avgAccuracy, latency: avgLatency },
      totals: { attempts: totalAttempts },
      trends: { accuracy: accuracyTrend, latency: latencyTrend }
    }
  }

  const stats = calculateStats()

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-chart-2" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const formatTrend = (trend: number, unit: string = "%") => {
    const sign = trend > 0 ? "+" : ""
    return `${sign}${trend.toFixed(1)}${unit}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats ? (
          <>
            {/* Current Session Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Session</span>
                <Badge variant={stats.current.mode === "learning" ? "default" : "secondary"}>
                  {stats.current.mode}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-chart-1" data-testid="current-accuracy">
                    {stats.current.accuracy.toFixed(0)}%
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    {getTrendIcon(stats.trends.accuracy)}
                    <span className="text-xs">{formatTrend(stats.trends.accuracy)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-chart-3" data-testid="current-latency">
                    {(stats.current.latency / 1000).toFixed(1)}s
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Response Time</span>
                    {getTrendIcon(stats.trends.latency)}
                    <span className="text-xs">{formatTrend(stats.trends.latency / 1000, "s")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Performance */}
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Overall Performance</span>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Accuracy</span>
                  <span className="font-medium" data-testid="avg-accuracy">
                    {stats.averages.accuracy.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Response Time</span>
                  <span className="font-medium" data-testid="avg-latency">
                    {(stats.averages.latency / 1000).toFixed(1)}s
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Attempts</span>
                  <span className="font-medium" data-testid="total-attempts">
                    {stats.totals.attempts}
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Progress Visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy Progress</span>
                <span>{stats.current.accuracy.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chart-1 transition-all duration-300"
                  style={{ width: `${Math.min(100, stats.current.accuracy)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No practice data available</p>
            <p className="text-sm">Start practicing to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}