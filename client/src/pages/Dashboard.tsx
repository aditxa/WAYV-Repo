import { useState } from "react"
import ConnectionStatus from "@/components/ConnectionStatus"
import ModeSelector from "@/components/ModeSelector"
import BrailleDisplay from "@/components/BrailleDisplay"
import ProgressChart from "@/components/ProgressChart"
import ErrorHeatmap from "@/components/ErrorHeatmap"
import AchievementBadges from "@/components/AchievementBadges"

export default function Dashboard() {
  const [currentMode, setCurrentMode] = useState<"learning" | "practice">("learning")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // TODO: Remove mock functionality - replace with real state management
  const [currentLetter] = useState("a")
  const [instruction] = useState("Let's start with the letter A. Fold finger 1 (left ring finger) to form the braille pattern.")

  const handleConnect = () => {
    setIsConnected(true)
    console.log("WAYV device connected")
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    console.log("WAYV device disconnected")
  }

  const handleModeChange = (mode: "learning" | "practice") => {
    setCurrentMode(mode)
    console.log(`Switched to ${mode} mode`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WAYV Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your braille learning journey
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus 
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Practice Area */}
        <div className="lg:col-span-2 space-y-6">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={handleModeChange}
            voiceEnabled={voiceEnabled}
            onVoiceToggle={setVoiceEnabled}
          />

          <BrailleDisplay
            currentLetter={currentLetter}
            instruction={instruction}
            mode={currentMode}
            speechEnabled={speechEnabled}
            onSpeechToggle={setSpeechEnabled}
            progress={{ current: 1, total: 26 }}
          />
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          <ProgressChart />
          
          <ErrorHeatmap />
        </div>
      </div>

      {/* Bottom Section - Achievements */}
      <AchievementBadges />
    </div>
  )
}