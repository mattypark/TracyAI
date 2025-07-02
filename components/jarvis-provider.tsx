'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { JarvisChat } from './jarvis-chat'
import { VoiceListener } from './voice-listener'
import { Button } from './ui/button'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JarvisContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
}

const JarvisContext = createContext<JarvisContextType | undefined>(undefined)

export function useJarvis() {
  const context = useContext(JarvisContext)
  if (context === undefined) {
    throw new Error('useJarvis must be used within a JarvisProvider')
  }
  return context
}

interface JarvisProviderProps {
  children: React.ReactNode
}

export function JarvisProvider({ children }: JarvisProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen(prev => !prev)

  const contextValue: JarvisContextType = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
  }

  return (
    <JarvisContext.Provider value={contextValue}>
      {children}
      
      {/* Only render on client side to avoid hydration issues */}
      {isClient && (
        <>
          {/* Voice Listener - always active in background */}
          <VoiceListener onTrigger={openChat} isEnabled={!isOpen} />
          
          {/* Floating Chat Button */}
          {!isOpen && (
            <Button
              onClick={openChat}
              className={cn(
                "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "transition-all duration-300 hover:scale-110"
              )}
              size="icon"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </Button>
          )}
          
          {/* Jarvis Chat Modal */}
          <JarvisChat isOpen={isOpen} onClose={closeChat} />
        </>
      )}
    </JarvisContext.Provider>
  )
} 