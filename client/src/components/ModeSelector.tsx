import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, Mic, MicOff } from "lucide-react"

interface ModeSelectorProps {
  currentMode: "learning" | "practice"
  onModeChange: (mode: "learning" | "practice") => void
  voiceEnabled: boolean
  onVoiceToggle: (enabled: boolean) => void
  className?: string
}

export default function ModeSelector({ 
  currentMode, 
  onModeChange, 
  voiceEnabled, 
  onVoiceToggle, 
  className 
}: ModeSelectorProps) {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceToggle = () => {
    const newVoiceEnabled = !voiceEnabled
    onVoiceToggle(newVoiceEnabled)
    
    if (newVoiceEnabled) {
      setIsListening(true)
      console.log("Voice commands activated")
      // TODO: Remove mock functionality - replace with actual voice recognition
    } else {
      setIsListening(false)
      console.log("Voice commands deactivated")
    }
  }

  const modes = [
    {
      id: "learning" as const,
      name: "Learning Mode",
      description: "Learn braille letters one by one with guided instruction",
      icon: BookOpen,
      color: "primary"
    },
    {
      id: "practice" as const, 
      name: "Practice Mode",
      description: "Practice spelling words and test your skills",
      icon: Target,
      color: "secondary"
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Learning Mode</span>
          <Button
            variant={voiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleVoiceToggle}
            className="gap-2"
            data-testid="button-voice-toggle"
          >
            {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            Voice Commands
            {isListening && voiceEnabled && (
              <Badge variant="default" className="ml-1">
                Listening
              </Badge>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = currentMode === mode.id
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`w-full p-4 rounded-md border transition-all text-left hover-elevate ${
                  isActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-border/80"
                }`}
                data-testid={`button-mode-${mode.id}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                        {mode.name}
                      </h3>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {voiceEnabled && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Voice Commands:</strong> Say "learning mode" or "practice mode" to switch between modes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}