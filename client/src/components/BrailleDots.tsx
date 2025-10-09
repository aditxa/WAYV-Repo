import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BrailleDotsProps {
  letter: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Braille patterns mapping (dots 1-6 in standard braille cell)
const brailleDots: { [key: string]: number[] } = {
  'a': [1],
  'b': [1, 2], 
  'c': [1, 4],
  'd': [1, 4, 5],
  'e': [1, 5],
  'f': [1, 2, 4],
  'g': [1, 2, 4, 5],
  'h': [1, 2, 5],
  'i': [2, 4],
  'j': [2, 4, 5],
  'k': [1, 3],
  'l': [1, 2, 3],
  'm': [1, 3, 4],
  'n': [1, 3, 4, 5],
  'o': [1, 3, 5],
  'p': [1, 2, 3, 4],
  'q': [1, 2, 3, 4, 5],
  'r': [1, 2, 3, 5],
  's': [2, 3, 4],
  't': [2, 3, 4, 5],
  'u': [1, 3, 6],
  'v': [1, 2, 3, 6],
  'w': [2, 4, 5, 6],
  'x': [1, 3, 4, 6],
  'y': [1, 3, 4, 5, 6],
  'z': [1, 3, 5, 6]
}

export default function BrailleDots({ 
  letter, 
  showLabel = true, 
  size = 'md',
  className 
}: BrailleDotsProps) {
  const activeDots = brailleDots[letter.toLowerCase()] || []
  
  const getDotSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3'
      case 'lg': return 'w-8 h-8'
      default: return 'w-6 h-6'
    }
  }

  const getGapSize = () => {
    switch (size) {
      case 'sm': return 'gap-1'
      case 'lg': return 'gap-4'
      default: return 'gap-2'
    }
  }

  const renderDot = (dotNumber: number) => {
    const isActive = activeDots.includes(dotNumber)
    const dotSize = getDotSize()
    
    return (
      <div
        key={dotNumber}
        className={`${dotSize} rounded-full border-2 transition-all ${
          isActive 
            ? 'bg-primary border-primary shadow-md' 
            : 'border-muted-foreground border-dashed bg-background'
        }`}
        data-testid={`braille-dot-${dotNumber}`}
        title={`Dot ${dotNumber}${isActive ? ' (active)' : ' (inactive)'}`}
      />
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Braille Pattern</span>
          {showLabel && (
            <Badge variant="outline" className="font-mono text-lg">
              {letter.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Braille Cell - Standard 2x3 layout */}
        <div className="flex justify-center">
          <div className={`grid grid-cols-2 ${getGapSize()}`}>
            {/* Left column: dots 1, 2, 3 */}
            <div className={`flex flex-col ${getGapSize()}`}>
              {renderDot(1)}
              {renderDot(2)}
              {renderDot(3)}
            </div>
            
            {/* Right column: dots 4, 5, 6 */}
            <div className={`flex flex-col ${getGapSize()}`}>
              {renderDot(4)}
              {renderDot(5)}
              {renderDot(6)}
            </div>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="space-y-2">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Active Dots</div>
            <div className="font-mono font-bold" data-testid="active-dots">
              {activeDots.length > 0 ? activeDots.join(', ') : 'None'}
            </div>
          </div>
          
          {/* Dot Layout Reference */}
          <div className="p-3 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground text-center mb-2">
              Standard Braille Cell Layout
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="text-center">1</div>
                  <div className="text-center">2</div>
                  <div className="text-center">3</div>
                </div>
                <div className="space-y-1">
                  <div className="text-center">4</div>
                  <div className="text-center">5</div>
                  <div className="text-center">6</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary border-primary"></div>
            <span>Active Dot</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground bg-background"></div>
            <span>Inactive Dot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get braille pattern for any letter
export function getBraillePattern(letter: string): number[] {
  return brailleDots[letter.toLowerCase()] || []
}

// Helper function to check if two patterns match
export function compareBraillePatterns(required: string, actual: number[]): boolean {
  const requiredPattern = getBraillePattern(required)
  return requiredPattern.length === actual.length && 
         requiredPattern.every(dot => actual.includes(dot))
}