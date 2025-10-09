import ProgressChart from "@/components/ProgressChart"
import ErrorHeatmap from "@/components/ErrorHeatmap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Clock, Zap } from "lucide-react"

export default function Analytics() {
  
  // TODO: Remove mock functionality - replace with real analytics data
  const mockStats = {
    totalSessions: 15,
    totalTime: 180, // minutes
    avgAccuracy: 84.5,
    bestStreak: 7,
    improvementRate: 12.3,
    fastestResponse: 0.8,
  }

  const analyticsCards = [
    {
      title: "Total Sessions",
      value: mockStats.totalSessions,
      icon: Target,
      description: "Learning sessions completed",
    },
    {
      title: "Practice Time",
      value: `${Math.floor(mockStats.totalTime / 60)}h ${mockStats.totalTime % 60}m`,
      icon: Clock,
      description: "Time spent practicing",
    },
    {
      title: "Average Accuracy",
      value: `${mockStats.avgAccuracy.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Overall performance score",
      trend: "+5.2%"
    },
    {
      title: "Best Response Time",
      value: `${mockStats.fastestResponse}s`,
      icon: Zap,
      description: "Fastest letter recognition",
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your braille learning progress
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`metric-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {card.value}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                  {card.trend && (
                    <Badge variant="secondary" className="text-xs">
                      {card.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart />
        <ErrorHeatmap />
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <span>Consistent improvement in accuracy over time</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <span>Strong performance with vowels (a, e, i, o, u)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <span>Faster response times in recent sessions</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Areas for Improvement</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span>Focus on letters with multiple finger positions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span>Practice mode needs more attention</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span>Consider shorter, more frequent sessions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}