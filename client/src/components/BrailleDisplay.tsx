import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface BrailleDisplayProps {
  currentLetter?: string
  instruction?: string
  mode: "learning" | "practice"
  currentWord?: string
  currentWordIndex?: number
  progress?: {
    current: number
    total: number
  }
  speechEnabled?: boolean
  onSpeechToggle?: (enabled: boolean) => void
  className?: string
}

export default function BrailleDisplay({
  currentLetter,
  instruction,
  mode,
  currentWord,
  currentWordIndex,
  progress,
  speechEnabled = true,
  onSpeechToggle,
  className
}: BrailleDisplayProps) {
  
  const braillePatterns = {
    "a": "⠁", "b": "⠃", "c": "⠉", "d": "⠙", "e": "⠑", "f": "⠋",
    "g": "⠛", "h": "⠓", "i": "⠊", "j": "⠚", "k": "⠅", "l": "⠇", 
    "m": "⠍", "n": "⠝", "o": "⠕", "p": "⠏", "q": "⠟", "r": "⠗",
    "s": "⠎", "t": "⠞", "u": "⠥", "v": "⠧", "w": "⠺", "x": "⠭",
    "y": "⠽", "z": "⠵"
  }

  const fingerFolds = {
    "a": "1", "b": "1, 2", "c": "1, 4", "d": "1, 4, 5",
    "e": "1, 5", "f": "1, 2, 4", "g": "1, 2, 4, 5",
    "h": "1, 2, 5", "i": "2, 4", "j": "2, 4, 5",
    "k": "1, 3", "l": "1, 2, 3", "m": "1, 3, 4",
    "n": "1, 3, 4, 5", "o": "1, 3, 5", "p": "1, 2, 3, 4",
    "q": "1, 2, 3, 4, 5", "r": "1, 2, 3, 5", "s": "2, 3, 4",
    "t": "2, 3, 4, 5", "u": "1, 3, 6", "v": "1, 2, 3, 6",
    "w": "2, 4, 5, 6", "x": "1, 3, 4, 6",
    "y": "1, 3, 4, 5, 6", "z": "1, 3, 5, 6"
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window && currentLetter) {
      const utterance = new SpeechSynthesisUtterance(
        `Letter ${currentLetter.toUpperCase()}. Fold fingers ${fingerFolds[currentLetter as keyof typeof fingerFolds]}`
      )
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const renderWordProgress = () => {
    if (mode !== "practice" || !currentWord) return null

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Word:</span>
          {progress && (
            <Badge variant="secondary">
              {progress.current} / {progress.total}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-mono tracking-wider">
          {currentWord.split('').map((letter, index) => (
            <span
              key={index}
              className={`inline-block ${
                index === currentWordIndex 
                  ? "text-primary font-bold bg-primary/10 px-1 rounded" 
                  : index < (currentWordIndex || 0)
                    ? "text-chart-2"
                    : "text-muted-foreground"
              }`}
            >
              {letter.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Braille Practice</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSpeechToggle?.(!speechEnabled)}
            className="gap-2"
            data-testid="button-speech-toggle"
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === "practice" ? renderWordProgress() : (
          <div className="space-y-4">
            {currentLetter && (
              <>
                <div className="text-center space-y-2">
                  <div className="text-6xl font-mono" data-testid="braille-pattern">
                    {braillePatterns[currentLetter as keyof typeof braillePatterns] || "⠀"}
                  </div>
                  <div className="text-3xl font-bold text-primary" data-testid="current-letter">
                    {currentLetter.toUpperCase()}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground mb-2">Finger positions:</div>
                  <div className="font-medium" data-testid="finger-instruction">
                    Fold fingers: {fingerFolds[currentLetter as keyof typeof fingerFolds]}
                  </div>
                </div>
              </>
            )}

            {instruction && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-md">
                <p className="text-sm" data-testid="instruction-text">
                  {instruction}
                </p>
              </div>
            )}

            {currentLetter && (
              <Button 
                onClick={handleSpeak}
                variant="outline"
                size="sm" 
                className="w-full gap-2"
                data-testid="button-speak"
              >
                <Volume2 className="h-4 w-4" />
                Speak Instruction
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}