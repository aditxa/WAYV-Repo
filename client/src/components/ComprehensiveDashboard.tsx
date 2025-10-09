import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Play, Pause, SkipForward, Volume2, Mic, Settings } from "lucide-react"
import { useVoiceSystem, type VoiceCommand } from "./VoiceSystem"
import ConnectionStatus from "./ConnectionStatus"
import BrailleDots from "./BrailleDots"
import FingerMapping from "./FingerMapping"
import AttemptTracker from "./AttemptTracker"
import ProgressChart from "./ProgressChart"
import ErrorHeatmap from "./ErrorHeatmap"
import AchievementBadges from "./AchievementBadges"
import DataExport from "./DataExport"
import ThemeToggle from "./ThemeToggle"

interface UserState {
  currentMode: 'learning' | 'practice'
  currentLetter: string
  currentWord?: string
  wordProgress?: { current: number, total: number }
  isConnected: boolean
  isPracticing: boolean
  sessionTime: number // seconds
  lastActivity: Date
}

interface InstructorView {
  showAdvanced: boolean
  selectedMetrics: string[]
  autoSpeak: boolean
  voiceRate: number
  downloadFormat: 'csv' | 'json'
}

export default function ComprehensiveDashboard() {
  // User state management
  const [userState, setUserState] = useState<UserState>({
    currentMode: 'learning',
    currentLetter: 'a',
    isConnected: false,
    isPracticing: false,
    sessionTime: 0,
    lastActivity: new Date()
  })

  // Instructor view settings
  const [instructorView, setInstructorView] = useState<InstructorView>({
    showAdvanced: true,
    selectedMetrics: ['progress', 'errors', 'attempts', 'achievements'],
    autoSpeak: true,
    voiceRate: 1.0,
    downloadFormat: 'csv'
  })

  // Current finger positions (mock data - TODO: connect to hardware)
  const [requiredFingers] = useState([1]) // For letter 'a'
  const [actualFingers] = useState([1, 2]) // Mock sensor data
  
  // Voice system with enhanced male voice
  const { speak, startListening, stopListening, addCommand, isListening, availableVoices, currentVoice } = useVoiceSystem({
    rate: instructorView.voiceRate,
    pitch: 0.7, // Lower pitch for more masculine sound
    volume: 1.0
  })

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (userState.isPracticing) {
      interval = setInterval(() => {
        setUserState(prev => ({
          ...prev,
          sessionTime: prev.sessionTime + 1,
          lastActivity: new Date()
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [userState.isPracticing])

  // Voice commands setup
  useEffect(() => {
    const commands: VoiceCommand[] = [
      {
        command: 'start-practice',
        patterns: ['start practice', 'begin practice', 'start learning', 'begin'],
        action: () => handleStartPractice(),
        description: 'Start practice session'
      },
      {
        command: 'stop-practice', 
        patterns: ['stop practice', 'pause', 'stop', 'end session'],
        action: () => handleStopPractice(),
        description: 'Stop/pause practice session'
      },
      {
        command: 'next-letter',
        patterns: ['next letter', 'skip', 'next', 'move on'],
        action: () => handleNextLetter(),
        description: 'Move to next letter'
      },
      {
        command: 'repeat-instruction',
        patterns: ['repeat', 'say again', 'help', 'instruction'],
        action: () => handleRepeatInstruction(),
        description: 'Repeat current instruction'
      },
      {
        command: 'learning-mode',
        patterns: ['learning mode', 'switch to learning', 'learning'],
        action: () => handleModeChange('learning'),
        description: 'Switch to learning mode'
      },
      {
        command: 'practice-mode',
        patterns: ['practice mode', 'switch to practice', 'practice'],
        action: () => handleModeChange('practice'),
        description: 'Switch to practice mode'
      },
      {
        command: 'check-progress',
        patterns: ['how am I doing', 'progress', 'stats', 'performance'],
        action: () => handleProgressCheck(),
        description: 'Check current progress'
      },
      {
        command: 'finger-position',
        patterns: ['finger position', 'which fingers', 'how to make', 'finger help'],
        action: () => handleFingerHelp(),
        description: 'Get finger position help'
      }
    ]

    commands.forEach(command => addCommand(command))
  }, [userState, addCommand])

  // Comprehensive feedback system
  const provideFeedback = async (type: 'success' | 'error' | 'instruction' | 'encouragement' | 'normal', message: string) => {
    if (!instructorView.autoSpeak) return

    let emphasis: 'normal' | 'excited' | 'encouraging' | 'gentle' = 'normal'
    
    switch (type) {
      case 'success':
        emphasis = 'excited'
        break
      case 'encouragement':
        emphasis = 'encouraging'
        break
      case 'error':
        emphasis = 'gentle'
        break
      default:
        emphasis = 'normal'
    }

    await speak(message, emphasis)
  }

  // Event handlers
  const handleStartPractice = () => {
    setUserState(prev => ({ ...prev, isPracticing: true }))
    provideFeedback('encouragement', 'Great! Let\'s start practicing. We\'ll begin with the letter A.')
  }

  const handleStopPractice = () => {
    setUserState(prev => ({ ...prev, isPracticing: false }))
    provideFeedback('normal', 'Practice paused. You can resume anytime by saying start practice.')
  }

  const handleNextLetter = () => {
    // TODO: Implement letter progression logic
    provideFeedback('instruction', 'Moving to the next letter. Let\'s try the letter B.')
  }

  const handleRepeatInstruction = () => {
    const currentInstruction = `To make the letter ${userState.currentLetter.toUpperCase()}, fold finger ${requiredFingers.join(' and ')}. Place your hand on the device and fold the indicated fingers.`
    provideFeedback('instruction', currentInstruction)
  }

  const handleModeChange = (mode: 'learning' | 'practice') => {
    setUserState(prev => ({ ...prev, currentMode: mode }))
    provideFeedback('normal', `Switched to ${mode} mode.`)
  }

  const handleProgressCheck = () => {
    // TODO: Get real stats from AttemptTracker
    provideFeedback('encouragement', 'You\'re doing great! Your accuracy is improving and you\'re getting faster. Keep up the excellent work!')
  }

  const handleFingerHelp = () => {
    const fingerNames = {1: 'left ring finger', 2: 'left middle finger', 3: 'left index finger', 4: 'right index finger', 5: 'right middle finger', 6: 'right ring finger'}
    const fingerInstructions = requiredFingers.map(f => fingerNames[f as keyof typeof fingerNames]).join(' and ')
    provideFeedback('instruction', `For the letter ${userState.currentLetter.toUpperCase()}, fold your ${fingerInstructions}.`)
  }

  const handleConnection = (connected: boolean) => {
    setUserState(prev => ({ ...prev, isConnected: connected }))
    provideFeedback('normal', connected ? 'WAYV device connected successfully!' : 'Device disconnected.')
  }

  const handleDataExport = (format: 'csv' | 'json') => {
    console.log(`Exporting data as ${format.toUpperCase()}`)
    // TODO: Implement actual data export
    provideFeedback('normal', `Data exported as ${format.toUpperCase()} file.`)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with controls */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">WAYV Learning System</h1>
            <Badge variant="outline" className="gap-2">
              <div className={`w-2 h-2 rounded-full ${userState.isConnected ? 'bg-chart-2' : 'bg-destructive'}`} />
              {userState.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Session time */}
            <div className="text-sm text-muted-foreground">
              Session: {formatTime(userState.sessionTime)}
            </div>

            {/* Quick export buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDataExport('csv')}
              className="gap-2"
              data-testid="button-quick-export-csv"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            
            <Button
              variant="outline" 
              size="sm"
              onClick={() => handleDataExport('json')}
              className="gap-2"
              data-testid="button-quick-export-json"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>

            {/* Voice controls */}
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className="gap-2"
              data-testid="button-voice-toggle"
            >
              <Mic className="h-4 w-4" />
              {isListening ? 'Listening' : 'Voice'}
            </Button>

            {/* Practice controls */}
            <Button
              variant={userState.isPracticing ? "secondary" : "default"}
              size="sm"
              onClick={userState.isPracticing ? handleStopPractice : handleStartPractice}
              className="gap-2"
              data-testid="button-practice-toggle"
            >
              {userState.isPracticing ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="p-6 space-y-6">
        {/* Connection Status */}
        <ConnectionStatus 
          onConnect={() => handleConnection(true)}
          onDisconnect={() => handleConnection(false)}
        />

        {/* Current Practice Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Letter Display */}
          <div className="lg:col-span-1">
            <BrailleDots 
              letter={userState.currentLetter}
              size="lg"
            />
          </div>

          {/* Finger Mapping */}
          <div className="lg:col-span-2">
            <FingerMapping
              requiredFingers={requiredFingers}
              actualFingers={actualFingers}
              currentLetter={userState.currentLetter}
              showComparison={true}
            />
          </div>

          {/* Current Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mode:</span>
                    <Badge variant={userState.currentMode === 'learning' ? 'default' : 'secondary'}>
                      {userState.currentMode}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Letter:</span>
                    <Badge variant="outline" className="font-mono">
                      {userState.currentLetter.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={userState.isPracticing ? 'default' : 'secondary'}>
                      {userState.isPracticing ? 'Practicing' : 'Paused'}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Voice:</span>
                    <Badge variant={isListening ? 'default' : 'outline'}>
                      {isListening ? 'Listening' : 'Ready'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleNextLetter}
                    className="w-full gap-2"
                    size="sm"
                    data-testid="button-next-letter"
                  >
                    <SkipForward className="h-4 w-4" />
                    Next Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attempt Tracking */}
          <div className="lg:col-span-1">
            <AttemptTracker />
          </div>

          {/* Progress Chart */}
          <div className="lg:col-span-1">
            <ProgressChart />
          </div>

          {/* Error Analysis */}
          <div className="lg:col-span-1">
            <ErrorHeatmap />
          </div>
        </div>

        {/* Achievements and Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AchievementBadges />
          
          <DataExport 
            onExportCSV={() => handleDataExport('csv')}
            onExportJSON={() => handleDataExport('json')}
          />
        </div>

        {/* Voice Commands Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Available Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {[
                { command: "Start Practice", example: "Say: 'Start practice' or 'Begin'" },
                { command: "Stop/Pause", example: "Say: 'Stop' or 'Pause'" },
                { command: "Next Letter", example: "Say: 'Next letter' or 'Skip'" },
                { command: "Repeat Help", example: "Say: 'Repeat' or 'Help'" },
                { command: "Learning Mode", example: "Say: 'Learning mode'" },
                { command: "Practice Mode", example: "Say: 'Practice mode'" },
                { command: "Check Progress", example: "Say: 'How am I doing?'" },
                { command: "Finger Help", example: "Say: 'Which fingers?'" }
              ].map((cmd, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-md">
                  <div className="font-medium text-primary">{cmd.command}</div>
                  <div className="text-muted-foreground text-xs mt-1">{cmd.example}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}