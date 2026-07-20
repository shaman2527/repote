import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 ¡Hola! Soy el asistente Repote. Pregúntame sobre FRP, flasheo, pantallas o reparación.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('El reconocimiento de voz no está disponible en este navegador. Usa Chrome en Android o Desktop.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      // Auto-send after voice input
      setTimeout(() => {
        sendMessage(transcript)
      }, 500)
    }

    recognition.onerror = () => {
      setListening(false)
      alert('Error al reconocer voz. Intenta de nuevo.')
    }

    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ No pude conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8000, o configúralo con VITE_API_URL.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl hover:bg-primary/90 transition-all"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {open && (
        <Card className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 max-h-[60vh] flex flex-col shadow-2xl border-primary/20">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>🤖 Asistente Repote</span>
              {loading && <span className="text-xs text-muted-foreground animate-pulse">pensando...</span>}
            </CardTitle>
          </CardHeader>
          <Separator className="my-2" />
          <CardContent className="p-3 pt-0 flex-1 overflow-y-auto max-h-[40vh] space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 pt-0 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre FRP, flasheo..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={listening ? stopListening : startListening}
                variant={listening ? 'destructive' : 'outline'}
                title={listening ? 'Detener grabación' : 'Grabar voz'}
              >
                🎤
              </Button>
              <Button size="icon" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ➤
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
