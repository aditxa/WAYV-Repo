import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, TrendingUp, RotateCcw } from "lucide-react"

interface AttemptData {
  id: string
  timestamp: Date
  letter: string
  requiredFingers: number[]
  actualFingers: number[]
  isCorrect: boolean
  responseTime: number // milliseconds
  mode: 'learning' | 'practice'
  session: string
}

interface AttemptStats {
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  averageResponseTime: number
  currentStreak: number
  bestStreak: number
  recentTrend: 'improving' | 'declining' | 'stable'
}

interface AttemptTrackerProps {
  attempts?: AttemptData[]
  onClearHistory?: () => void
  className?: string
}

export default function AttemptTracker({ 
  attempts = [], 
  onClearHistory,
  className 
}: AttemptTrackerProps) {
  
  // TODO: Remove mock functionality - replace with real attempt data
  const [mockAttempts] = useState<AttemptData[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      letter: 'a',
      requiredFingers: [1],
      actualFingers: [1],
      isCorrect: true,
      responseTime: 2400,
      mode: 'learning',
      session: 'session_1'
    },
    {
      id: '2', 
      timestamp: new Date(Date.now() - 240000),
      letter: 'b',
      requiredFingers: [1, 2],
      actualFingers: [1, 3],
      isCorrect: false,
      responseTime: 3100,
      mode: 'learning',
      session: 'session_1'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 180000),
      letter: 'b',
      requiredFingers: [1, 2],
      actualFingers: [1, 2],
      isCorrect: true,
      responseTime: 2800,
      mode: 'learning', 
      session: 'session_1'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 120000),
      letter: 'c',
      requiredFingers: [1, 4],
      actualFingers: [1, 4],
      isCorrect: true,
      responseTime: 2200,
      mode: 'learning',
      session: 'session_1'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60000),
      letter: 'd',
      requiredFingers: [1, 4, 5],
      actualFingers: [1, 4, 6],
      isCorrect: false,
      responseTime: 3500,
      mode: 'practice',
      session: 'session_1'
    }
  ])

  const currentAttempts = attempts.length > 0 ? attempts : mockAttempts

  const calculateStats = (): AttemptStats => {
    if (currentAttempts.length === 0) {
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        averageResponseTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        recentTrend: 'stable'
      }
    }

    const totalAttempts = currentAttempts.length
    const correctAttempts = currentAttempts.filter(a => a.isCorrect).length
    const accuracy = (correctAttempts / totalAttempts) * 100
    const averageResponseTime = currentAttempts.reduce((sum, a) => sum + a.responseTime, 0) / totalAttempts

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    for (let i = currentAttempts.length - 1; i >= 0; i--) {
      if (currentAttempts[i].isCorrect) {
        tempStreak++
        if (i === currentAttempts.length - 1) {
          currentStreak = tempStreak
        }
      } else {
        if (i === currentAttempts.length - 1) {
          currentStreak = 0
        }
        bestStreak = Math.max(bestStreak, tempStreak)
        tempStreak = 0
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak)

    // Calculate trend (last 5 vs previous 5)
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable'
    if (currentAttempts.length >= 10) {
      const recent5 = currentAttempts.slice(-5)
      const previous5 = currentAttempts.slice(-10, -5)
      
      const recentAccuracy = recent5.filter(a => a.isCorrect).length / 5
      const previousAccuracy = previous5.filter(a => a.isCorrect).length / 5
      
      if (recentAccuracy > previousAccuracy + 0.1) {
        recentTrend = 'improving'
      } else if (recentAccuracy < previousAccuracy - 0.1) {
        recentTrend = 'declining'
      }
    }

    return {
      totalAttempts,
      correctAttempts,
      accuracy,
      averageResponseTime,
      currentStreak,
      bestStreak,
      recentTrend
    }
  }

  const stats = calculateStats()
  const recentAttempts = currentAttempts.slice(-10).reverse()

  const getTrendIcon = () => {
    switch (stats.recentTrend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-chart-2" />
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatFingers = (fingers: number[]) => {
    return fingers.join(', ')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attempt History</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="outline">
              {stats.totalAttempts} attempts
            </Badge>
            {onClearHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="text-xs"
                data-testid="button-clear-history"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xl font-bold text-chart-2" data-testid="accuracy-stat">
              {stats.accuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xl font-bold" data-testid="response-time-stat">
              {formatTime(stats.averageResponseTime)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xl font-bold text-chart-3" data-testid="current-streak-stat">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xl font-bold" data-testid="best-streak-stat">
              {stats.bestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recent Attempts</span>
            <span className="text-xs text-muted-foreground">
              Last {Math.min(10, currentAttempts.length)} attempts
            </span>
          </div>
          
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {recentAttempts.map((attempt, index) => (
              <div
                key={attempt.id}
                className={`flex items-center gap-3 p-2 rounded text-sm border ${
                  attempt.isCorrect 
                    ? 'border-chart-2/20 bg-chart-2/5' 
                    : 'border-destructive/20 bg-destructive/5'
                }`}
                data-testid={`attempt-${attempt.id}`}
              >
                <div className="flex-shrink-0">
                  {attempt.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                
                <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                  <Badge variant="outline" className="font-mono justify-center">
                    {attempt.letter.toUpperCase()}
                  </Badge>
                  
                  <div className="text-xs">
                    <div className="font-medium">Required: {formatFingers(attempt.requiredFingers)}</div>
                    <div className={attempt.isCorrect ? 'text-chart-2' : 'text-destructive'}>
                      Actual: {formatFingers(attempt.actualFingers)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatTime(attempt.responseTime)}
                  </div>
                  
                  <Badge 
                    variant={attempt.mode === 'learning' ? 'default' : 'secondary'}
                    className="text-xs justify-center"
                  >
                    {attempt.mode}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground text-right">
                    {attempt.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentAttempts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No attempts recorded yet</p>
            <p className="text-sm">Start practicing to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}