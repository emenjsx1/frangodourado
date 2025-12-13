import { useRef, useCallback, useEffect, useState } from 'react'

type SoundType = 'order' | 'call'

// Caminhos dos arquivos de áudio (se existirem)
const SOUND_PATHS = {
  order: '/sounds/cash-register.mp3', // Som de caixa registradora para pedidos
  call: '/sounds/bell.mp3', // Som de campainha para chamadas
}

/**
 * Hook para tocar som de notificação usando Web Audio API
 * Cria sons diferentes para pedidos (caixa registradora) e chamadas (campainha)
 */
export function useNotificationSound(soundType: SoundType = 'order') {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [useFile, setUseFile] = useState(false)

  // Ativar o contexto de áudio na primeira interação do usuário
  useEffect(() => {
    const enableAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Se o contexto estiver suspenso, tentar retomar
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        setIsEnabled(true)
        console.log('✅ Sistema de notificação sonora ativado')
      } catch (error) {
        console.warn('⚠️ Não foi possível ativar o sistema de som:', error)
      }
    }

    // Ativar quando o usuário interagir com a página (click, touch, keypress)
    const events = ['click', 'touchstart', 'keydown']
    const handlers = events.map(event => {
      const handler = () => {
        enableAudio()
        events.forEach(e => document.removeEventListener(e, handlers[events.indexOf(e)]))
      }
      document.addEventListener(event, handler, { once: true })
      return handler
    })

    return () => {
      events.forEach((event, index) => {
        document.removeEventListener(event, handlers[index])
      })
    }
  }, [])

  // Som de campainha para chamadas de atendente
  const playBellSound = useCallback((audioContext: AudioContext) => {
    try {
      // Primeira campainha (mais aguda)
      const oscillator1 = audioContext.createOscillator()
      const gainNode1 = audioContext.createGain()

      oscillator1.connect(gainNode1)
      gainNode1.connect(audioContext.destination)

      oscillator1.type = 'sine' // Onda senoidal para som mais suave de campainha
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2)

      gainNode1.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode1.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05)
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator1.start(audioContext.currentTime)
      oscillator1.stop(audioContext.currentTime + 0.2)

      // Segunda campainha (mais grave, um pouco depois)
      setTimeout(() => {
        try {
          const oscillator2 = audioContext.createOscillator()
          const gainNode2 = audioContext.createGain()

          oscillator2.connect(gainNode2)
          gainNode2.connect(audioContext.destination)

          oscillator2.type = 'sine'
          oscillator2.frequency.setValueAtTime(600, audioContext.currentTime)
          oscillator2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2)

          gainNode2.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode2.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05)
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

          oscillator2.start(audioContext.currentTime)
          oscillator2.stop(audioContext.currentTime + 0.2)
        } catch (error) {
          console.warn('Erro ao tocar segunda campainha:', error)
        }
      }, 100)
    } catch (error) {
      console.warn('Erro ao tocar som de campainha:', error)
    }
  }, [])

  // Som de caixa registradora para pedidos
  const playCashRegisterSound = useCallback((audioContext: AudioContext) => {
    try {
      // Primeiro "ding" (som de caixa registradora)
      const oscillator1 = audioContext.createOscillator()
      const gainNode1 = audioContext.createGain()

      oscillator1.connect(gainNode1)
      gainNode1.connect(audioContext.destination)

      oscillator1.type = 'square' // Onda quadrada para som mais metálico
      oscillator1.frequency.setValueAtTime(1200, audioContext.currentTime)
      oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1)

      gainNode1.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode1.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.02)
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator1.start(audioContext.currentTime)
      oscillator1.stop(audioContext.currentTime + 0.1)

      // Segundo "ding" (mais agudo, característico de caixa registradora)
      setTimeout(() => {
        try {
          const oscillator2 = audioContext.createOscillator()
          const gainNode2 = audioContext.createGain()

          oscillator2.connect(gainNode2)
          gainNode2.connect(audioContext.destination)

          oscillator2.type = 'square'
          oscillator2.frequency.setValueAtTime(1500, audioContext.currentTime)
          oscillator2.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.08)

          gainNode2.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode2.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.02)
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08)

          oscillator2.start(audioContext.currentTime)
          oscillator2.stop(audioContext.currentTime + 0.08)
        } catch (error) {
          console.warn('Erro ao tocar segundo ding:', error)
        }
      }, 80)
    } catch (error) {
      console.warn('Erro ao tocar som de caixa registradora:', error)
    }
  }, [])

  // Tentar carregar arquivo de áudio primeiro, se existir
  useEffect(() => {
    const audioPath = SOUND_PATHS[soundType]
    const audio = new Audio(audioPath)
    
    audio.addEventListener('canplaythrough', () => {
      setUseFile(true)
      audioElementRef.current = audio
      console.log(`✅ Arquivo de áudio carregado: ${audioPath}`)
    })
    
    audio.addEventListener('error', () => {
      setUseFile(false)
      console.log(`ℹ️ Arquivo de áudio não encontrado (${audioPath}), usando som gerado`)
    })
    
    audio.load()
    
    return () => {
      audio.removeEventListener('canplaythrough', () => {})
      audio.removeEventListener('error', () => {})
    }
  }, [soundType])

  const playGeneratedSound = useCallback(() => {
    try {
      // Verificar se o contexto está disponível
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      // Se o contexto estiver suspenso, tentar retomar
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('🔊 Contexto de áudio retomado')
        }).catch(err => {
          console.warn('⚠️ Não foi possível retomar o contexto de áudio:', err)
          return
        })
      }

      // Tocar som baseado no tipo
      if (soundType === 'call') {
        playBellSound(audioContext)
      } else {
        playCashRegisterSound(audioContext)
      }
    } catch (error) {
      console.warn('⚠️ Erro ao tocar som gerado:', error)
    }
  }, [soundType, playBellSound, playCashRegisterSound])

  const playSound = useCallback(() => {
    try {
      // Tentar usar arquivo de áudio primeiro
      if (useFile && audioElementRef.current) {
        const audio = audioElementRef.current.cloneNode() as HTMLAudioElement
        audio.volume = 0.7
        audio.play().catch(err => {
          console.warn('⚠️ Erro ao tocar arquivo de áudio, usando som gerado:', err)
          // Fallback para som gerado
          playGeneratedSound()
        })
        return
      }

      // Usar som gerado programaticamente como fallback
      playGeneratedSound()
    } catch (error) {
      console.warn('⚠️ Erro ao tocar som de notificação:', error)
    }
  }, [useFile, playGeneratedSound])

  return playSound
}

