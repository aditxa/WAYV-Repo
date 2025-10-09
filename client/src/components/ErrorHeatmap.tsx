import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ErrorData {
  letter: string
  errors: number
  attempts: number
}

interface ErrorHeatmapProps {
  errorData?: ErrorData[]
  className?: string
}

export default function ErrorHeatmap({ errorData = [], className }: ErrorHeatmapProps) {
  
  // TODO: Remove mock functionality - replace with real error data from storage  
  const mockErrorData: ErrorData[] = [
    { letter: "q", errors: 8, attempts: 12 },
    { letter: "w", errors: 6, attempts: 15 },
    { letter: "p", errors: 5, attempts: 18 },
    { letter: "y", errors: 4, attempts: 20 },
    { letter: "j", errors: 3, attempts: 14 },
    { letter: "x", errors: 3, attempts: 16 },
    { letter: "z", errors: 2, attempts: 10 },
    { letter: "t", errors: 2, attempts: 22 },
    { letter: "r", errors: 1, attempts: 25 },
    { letter: "n", errors: 1, attempts: 19 },
  ]

  const currentData = errorData.length > 0 ? errorData : mockErrorData
  
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")
  
  const getErrorRate = (letter: string) => {
    const data = currentData.find(d => d.letter === letter)
    if (!data || data.attempts === 0) return 0
    return (data.errors / data.attempts) * 100
  }

  const getIntensityClass = (errorRate: number) => {
    if (errorRate === 0) return "bg-muted/20 text-muted-foreground"
    if (errorRate < 20) return "bg-chart-2/20 text-chart-2"
    if (errorRate < 40) return "bg-chart-3/40 text-chart-3"
    if (errorRate < 60) return "bg-destructive/60 text-destructive-foreground"
    return "bg-destructive text-destructive-foreground"
  }

  const getMostProblematic = () => {
    return [...currentData]
      .sort((a, b) => (b.errors / b.attempts) - (a.errors / a.attempts))
      .slice(0, 3)
  }

  const problematicLetters = getMostProblematic()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Error Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alphabet Grid Heatmap */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Letter Error Rates</div>
          <div className="grid grid-cols-6 gap-2">
            {alphabet.map(letter => {
              const errorRate = getErrorRate(letter)
              const data = currentData.find(d => d.letter === letter)
              
              return (
                <div
                  key={letter}
                  className={`aspect-square flex items-center justify-center rounded-md text-sm font-mono font-medium transition-colors ${getIntensityClass(errorRate)}`}
                  title={data ? `${letter.toUpperCase()}: ${data.errors}/${data.attempts} errors (${errorRate.toFixed(0)}%)` : `${letter.toUpperCase()}: No data`}
                  data-testid={`heatmap-${letter}`}
                >
                  {letter.toUpperCase()}
                </div>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Error Rate:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/20 rounded-sm"></div>
              <span>0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-2/20 rounded-sm"></div>
              <span>&lt;20%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-3/40 rounded-sm"></div>
              <span>&lt;40%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-sm"></div>
              <span>≥40%</span>
            </div>
          </div>
        </div>

        {/* Most Problematic Letters */}
        {problematicLetters.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Focus Areas</div>
            <div className="space-y-2">
              {problematicLetters.map((data, index) => {
                const errorRate = (data.errors / data.attempts) * 100
                
                return (
                  <div
                    key={data.letter}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                    data-testid={`focus-${data.letter}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {data.letter.toUpperCase()}
                      </Badge>
                      <div className="text-sm">
                        <div className="font-medium">
                          {data.errors} errors in {data.attempts} attempts
                        </div>
                        <div className="text-muted-foreground">
                          {errorRate.toFixed(1)}% error rate
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Needs Practice
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {currentData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No error data available</p>
            <p className="text-sm">Practice more to see error patterns!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}