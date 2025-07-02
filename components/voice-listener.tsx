'use client'

import { useEffect, useRef } from 'react'

interface VoiceListenerProps {
  onTrigger: () => void
  isEnabled?: boolean
}

export function VoiceListener({ onTrigger, isEnabled = true }: VoiceListenerProps) {
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return

    // Clear any existing timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    // Stop any existing recognition
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        // Ignore errors when stopping
      }
      isListeningRef.current = false
    }

    // Initialize speech recognition only if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          try {
            const lastResult = event.results[event.results.length - 1]
            if (lastResult.isFinal) {
              const transcript = lastResult[0].transcript.trim().toLowerCase()
              
              // Check for activation phrases
              const activationPhrases = [
                'hey tracy',
                'hey tracy ai',
                'tracy',
                'hello tracy'
              ]
              
              const isActivated = activationPhrases.some(phrase => 
                transcript.includes(phrase)
              )
              
              if (isActivated) {
                console.log('Voice activation detected:', transcript)
                onTrigger()
              }
            }
          } catch (error) {
            console.error('Error processing voice result:', error)
          }
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          
          // Don't restart on certain errors
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            console.warn('Voice recognition not allowed by user')
            return
          }
          
          // Stop current instance
          isListeningRef.current = false
          
          // Restart after a delay only if still enabled
          if (isEnabled) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isEnabled && recognitionRef.current && !isListeningRef.current) {
                try {
                  isListeningRef.current = true
                  recognitionRef.current.start()
                } catch (error) {
                  console.error('Failed to restart recognition:', error)
                  isListeningRef.current = false
                }
              }
            }, 2000) // Wait 2 seconds before restart
          }
        }
        
        recognitionRef.current.onend = () => {
          isListeningRef.current = false
          
          // Only restart if still enabled and not manually stopped
          if (isEnabled && recognitionRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isEnabled && recognitionRef.current && !isListeningRef.current) {
                try {
                  isListeningRef.current = true
                  recognitionRef.current.start()
                } catch (error) {
                  console.error('Failed to restart recognition:', error)
                  isListeningRef.current = false
                }
              }
            }, 100)
          }
        }
        
        // Start listening
        if (!isListeningRef.current) {
          isListeningRef.current = true
          recognitionRef.current.start()
          console.log('Voice listener started - say "Hey Tracy" to activate')
        }
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error)
      }
    } else {
      console.warn('Speech recognition not supported in this browser')
    }

    // Cleanup function
    return () => {
      // Clear timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
      
      // Stop recognition
      if (recognitionRef.current && isListeningRef.current) {
        isListeningRef.current = false
        try {
          recognitionRef.current.stop()
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  }, [onTrigger, isEnabled])

  // This component doesn't render anything visible
  return null
} 