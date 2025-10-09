import { useState } from 'react'
import BrailleDisplay from '../BrailleDisplay'

export default function BrailleDisplayExample() {
  const [speechEnabled, setSpeechEnabled] = useState(true)

  return (
    <BrailleDisplay
      currentLetter="a"
      instruction="Let's start with the letter A. Fold finger 1 (left ring finger) to form the braille pattern."
      mode="learning"
      progress={{ current: 1, total: 26 }}
      speechEnabled={speechEnabled}
      onSpeechToggle={setSpeechEnabled}
    />
  )
}