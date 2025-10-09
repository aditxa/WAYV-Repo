import { useState, useEffect, useCallback } from "react"

interface VoiceSystemConfig {
  rate: number
  pitch: number
  volume: number
  preferredVoice?: string
}

interface VoiceCommand {
  command: string
  patterns: string[]
  action: () => void
  description: string
}

class EnhancedVoiceSystem {
  private synth: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private maleVoices: SpeechSynthesisVoice[] = []
  private currentVoice: SpeechSynthesisVoice | null = null
  private config: VoiceSystemConfig
  private recognition: any = null
  private isListening = false
  private voiceCommands: VoiceCommand[] = []

  constructor(config: VoiceSystemConfig) {
    this.synth = window.speechSynthesis
    this.config = config
    this.loadVoices()
    this.setupSpeechRecognition()
    
    // Reload voices when they change
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices()
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices()
    
    // Filter for male voices using multiple criteria
    this.maleVoices = this.voices.filter(voice => {
      const name = voice.name.toLowerCase()
      const lang = voice.lang.toLowerCase()
      
      return (
        // Explicit male voice names
        name.includes('male') ||
        name.includes('man') ||
        // Common male voice names
        name.includes('david') ||
        name.includes('mark') ||
        name.includes('daniel') ||
        name.includes('alex') ||
        name.includes('tom') ||
        name.includes('james') ||
        name.includes('john') ||
        name.includes('michael') ||
        // Platform-specific male voices
        name.includes('microsoft mark') ||
        name.includes('google us english male') ||
        name.includes('enhanced male') ||
        // Filter out obvious female names
        (!name.includes('female') && 
         !name.includes('woman') &&
         !name.includes('zira') &&
         !name.includes('susan') &&
         !name.includes('hazel') &&
         !name.includes('karen') &&
         !name.includes('vicki'))
      ) && lang.startsWith('en') // English only
    })

    // Select best male voice
    this.selectBestMaleVoice()
  }

  private selectBestMaleVoice() {
    if (this.maleVoices.length === 0) {
      this.currentVoice = this.voices[0] || null
      return
    }

    // Prioritize high-quality voices
    const priorities = [
      'microsoft mark',
      'google us english male', 
      'daniel',
      'alex',
      'david',
      'male'
    ]

    for (const priority of priorities) {
      const voice = this.maleVoices.find(v => 
        v.name.toLowerCase().includes(priority)
      )
      if (voice) {
        this.currentVoice = voice
        return
      }
    }

    // Fallback to first available male voice
    this.currentVoice = this.maleVoices[0]
  }

  private setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
      
      this.recognition.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          this.processVoiceCommand(finalTranscript.toLowerCase().trim())
        }
      }

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          this.speak("Microphone access denied. Please enable microphone permissions to use voice commands.")
        }
      }

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start() // Restart if still listening
        }
      }
    }
  }

  speak(text: string, options: Partial<VoiceSystemConfig> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any current speech
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply voice settings
      if (this.currentVoice) {
        utterance.voice = this.currentVoice
      }
      
      utterance.rate = options.rate ?? this.config.rate
      utterance.pitch = options.pitch ?? this.config.pitch
      utterance.volume = options.volume ?? this.config.volume

      utterance.onend = () => resolve()
      utterance.onerror = (e) => reject(e)

      this.synth.speak(utterance)
    })
  }

  speakWithEmphasis(text: string, emphasis: 'normal' | 'excited' | 'encouraging' | 'gentle' = 'normal'): Promise<void> {
    let config: Partial<VoiceSystemConfig> = {}
    
    switch (emphasis) {
      case 'excited':
        config = { rate: 1.2, pitch: 1.1, volume: 1.0 }
        break
      case 'encouraging':
        config = { rate: 0.9, pitch: 0.9, volume: 1.0 }
        break
      case 'gentle':
        config = { rate: 0.8, pitch: 0.8, volume: 0.8 }
        break
      default:
        config = { rate: 1.0, pitch: 0.8, volume: 1.0 }
    }

    return this.speak(text, config)
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true
      try {
        this.recognition.start()
        console.log('Voice recognition started')
      } catch (error) {
        console.error('Error starting voice recognition:', error)
        this.isListening = false
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false
      this.recognition.stop()
      console.log('Voice recognition stopped')
    }
  }

  addVoiceCommand(command: VoiceCommand) {
    this.voiceCommands.push(command)
  }

  removeVoiceCommand(command: string) {
    this.voiceCommands = this.voiceCommands.filter(cmd => cmd.command !== command)
  }

  private processVoiceCommand(transcript: string) {
    console.log('Processing voice command:', transcript)
    
    for (const command of this.voiceCommands) {
      for (const pattern of command.patterns) {
        if (transcript.includes(pattern.toLowerCase())) {
          console.log('Executing command:', command.command)
          command.action()
          return
        }
      }
    }
  }

  getMaleVoices(): SpeechSynthesisVoice[] {
    return this.maleVoices
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.currentVoice
  }

  setVoice(voiceName: string) {
    const voice = this.maleVoices.find(v => v.name === voiceName)
    if (voice) {
      this.currentVoice = voice
    }
  }

  updateConfig(newConfig: Partial<VoiceSystemConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getCommands(): VoiceCommand[] {
    return this.voiceCommands
  }
}

// Hook for using the voice system
export function useVoiceSystem(config: VoiceSystemConfig = { rate: 1.0, pitch: 0.8, volume: 1.0 }) {
  const [voiceSystem, setVoiceSystem] = useState<EnhancedVoiceSystem | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const system = new EnhancedVoiceSystem(config)
    setVoiceSystem(system)

    // Update voices when they load
    const updateVoices = () => {
      setAvailableVoices(system.getMaleVoices())
      setCurrentVoice(system.getCurrentVoice())
    }

    const timer = setInterval(updateVoices, 100)
    setTimeout(() => clearInterval(timer), 2000)

    return () => {
      system.stopListening()
      clearInterval(timer)
    }
  }, [])

  const speak = useCallback((text: string, emphasis?: 'normal' | 'excited' | 'encouraging' | 'gentle') => {
    if (voiceSystem) {
      return voiceSystem.speakWithEmphasis(text, emphasis)
    }
    return Promise.resolve()
  }, [voiceSystem])

  const startListening = useCallback(() => {
    if (voiceSystem) {
      voiceSystem.startListening()
      setIsListening(true)
    }
  }, [voiceSystem])

  const stopListening = useCallback(() => {
    if (voiceSystem) {
      voiceSystem.stopListening()
      setIsListening(false)
    }
  }, [voiceSystem])

  const addCommand = useCallback((command: VoiceCommand) => {
    if (voiceSystem) {
      voiceSystem.addVoiceCommand(command)
    }
  }, [voiceSystem])

  return {
    voiceSystem,
    speak,
    startListening,
    stopListening,
    addCommand,
    isListening,
    availableVoices,
    currentVoice,
    setVoice: (voiceName: string) => {
      if (voiceSystem) {
        voiceSystem.setVoice(voiceName)
        setCurrentVoice(voiceSystem.getCurrentVoice())
      }
    }
  }
}

export type { VoiceCommand, VoiceSystemConfig }