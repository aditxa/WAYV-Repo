import { useState } from 'react'
import ModeSelector from '../ModeSelector'

export default function ModeSelectorExample() {
  const [currentMode, setCurrentMode] = useState<"learning" | "practice">("learning")
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <ModeSelector
      currentMode={currentMode}
      onModeChange={setCurrentMode}
      voiceEnabled={voiceEnabled}
      onVoiceToggle={setVoiceEnabled}
    />
  )
}