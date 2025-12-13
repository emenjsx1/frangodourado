import { useRef, useCallback } from 'react'

/**
 * Hook para tocar som de notificação usando Web Audio API
 * Cria um "barulho" programaticamente sem precisar de arquivo de áudio
 */
export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback(() => {
    try {
      // Criar AudioContext se não existir
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      
      // Criar um oscilador para gerar o som
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Conectar os nós
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configurar o tipo de onda (square = som mais "barulhento")
      oscillator.type = 'square'
      
      // Frequência inicial (mais aguda) - som mais alto e chamativo
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      
      // Frequência final (mais grave) - cria um "barulho" descendente
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15)

      // Configurar volume (gain) - mais alto para ser mais perceptível
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)

      // Tocar o som
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.25)

      // Tocar um segundo "beep" para fazer um "barulho" duplo mais chamativo
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()

        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)

        oscillator2.type = 'square'
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15)

        gainNode2.gain.setValueAtTime(0.5, audioContext.currentTime)
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)

        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.25)
      }, 150)
    } catch (error) {
      console.log('Erro ao tocar som de notificação:', error)
    }
  }, [])

  return playSound
}

