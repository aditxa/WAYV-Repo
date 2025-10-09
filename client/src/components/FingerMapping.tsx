import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface FingerPosition {
  finger: number // 1-6
  required: boolean
  actual: boolean
  correct?: boolean
}

interface FingerMappingProps {
  requiredFingers: number[] // Array of finger numbers that should be folded
  actualFingers: number[] // Array of finger numbers that are actually folded
  currentLetter?: string
  showComparison?: boolean
  className?: string
}

export default function FingerMapping({ 
  requiredFingers, 
  actualFingers, 
  currentLetter,
  showComparison = true,
  className 
}: FingerMappingProps) {
  
  // Create finger position data
  const fingerPositions: FingerPosition[] = [1, 2, 3, 4, 5, 6].map(finger => ({
    finger,
    required: requiredFingers.includes(finger),
    actual: actualFingers.includes(finger),
    correct: requiredFingers.includes(finger) === actualFingers.includes(finger)
  }))

  const correctCount = fingerPositions.filter(f => f.correct).length
  const accuracy = (correctCount / 6) * 100

  const getFingerName = (finger: number): string => {
    const names = {
      1: "L Ring",
      2: "L Middle", 
      3: "L Index",
      4: "R Index",
      5: "R Middle",
      6: "R Ring"
    }
    return names[finger as keyof typeof names] || `Finger ${finger}`
  }

  const renderFingerCircle = (position: FingerPosition, type: 'required' | 'actual') => {
    const isActive = type === 'required' ? position.required : position.actual
    const isCorrect = position.correct
    
    let circleClass = "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all"
    
    if (showComparison) {
      if (isActive && isCorrect) {
        circleClass += " bg-chart-2 border-chart-2 text-chart-2-foreground"
      } else if (isActive && !isCorrect) {
        circleClass += " bg-destructive border-destructive text-destructive-foreground"
      } else if (!isActive && isCorrect) {
        circleClass += " border-muted-foreground text-muted-foreground"
      } else {
        circleClass += " border-muted text-muted-foreground"
      }
    } else {
      if (isActive) {
        circleClass += " bg-primary border-primary text-primary-foreground"
      } else {
        circleClass += " border-muted-foreground text-muted-foreground"
      }
    }

    return (
      <div 
        className={circleClass}
        data-testid={`finger-${type}-${position.finger}`}
      >
        {position.finger}
      </div>
    )
  }

  const renderHandDiagram = (type: 'required' | 'actual') => (
    <div className="space-y-3">
      <div className="text-sm font-medium text-center">
        {type === 'required' ? 'Required Position' : 'Your Position'}
      </div>
      
      {/* Left Hand */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground text-center">Left Hand</div>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map(finger => {
            const position = fingerPositions.find(f => f.finger === finger)!
            return (
              <div key={finger} className="text-center space-y-1">
                {renderFingerCircle(position, type)}
                <div className="text-xs text-muted-foreground">
                  {getFingerName(finger).split(' ')[1]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Hand */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground text-center">Right Hand</div>
        <div className="flex gap-2 justify-center">
          {[4, 5, 6].map(finger => {
            const position = fingerPositions.find(f => f.finger === finger)!
            return (
              <div key={finger} className="text-center space-y-1">
                {renderFingerCircle(position, type)}
                <div className="text-xs text-muted-foreground">
                  {getFingerName(finger).split(' ')[1]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Finger Positions</span>
          {currentLetter && (
            <Badge variant="outline" className="font-mono">
              {currentLetter.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showComparison && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              {accuracy === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-chart-3" />
              )}
              <span className="font-medium">
                Position Accuracy: {accuracy.toFixed(0)}%
              </span>
            </div>
            <Badge variant={accuracy === 100 ? "default" : "secondary"}>
              {correctCount}/6 correct
            </Badge>
          </div>
        )}

        <div className={`grid gap-6 ${showComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {renderHandDiagram('required')}
          {showComparison && renderHandDiagram('actual')}
        </div>

        {showComparison && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Position Details</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {fingerPositions.map(position => (
                <div 
                  key={position.finger}
                  className={`flex items-center justify-between p-2 rounded border ${
                    position.correct ? 'border-chart-2/20 bg-chart-2/5' : 'border-destructive/20 bg-destructive/5'
                  }`}
                >
                  <span>{getFingerName(position.finger)}</span>
                  <div className="flex items-center gap-1">
                    {position.required && <span className="text-primary">Required</span>}
                    {position.actual && <span className="text-foreground">Detected</span>}
                    {position.correct ? (
                      <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="p-3 bg-muted/30 rounded-md">
          <div className="text-sm font-medium mb-2">Legend</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary border-primary"></div>
              <span>Active/Folded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground"></div>
              <span>Inactive/Extended</span>
            </div>
            {showComparison && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-chart-2 border-chart-2"></div>
                  <span>Correct Position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-destructive border-destructive"></div>
                  <span>Incorrect Position</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}