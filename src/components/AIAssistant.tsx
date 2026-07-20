import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Loader2,
  Wrench,
  MonitorSmartphone,
  Zap,
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente Repote. Pregúntame sobre FRP, flasheo, pantallas o reparación de teléfonos.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const sendMessageRef = useRef<typeof sendMessage>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    sendMessageRef.current = sendMessage
  })

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('El reconocimiento de voz no está disponible. Usa Chrome.')
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
      setTimeout(() => sendMessageRef.current?.(transcript), 500)
    }

    recognition.onerror = () => setListening(false)
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
        content: 'No pude conectar con el servidor. Asegúrate de que el backend esté corriendo en :8000.',
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
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 size-12 rounded-2xl bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary transition-all active:scale-95 backdrop-blur-xl"
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <Card className="fixed bottom-40 right-4 md:bottom-24 md:right-8 z-50 w-[calc(100vw-2rem)] md:w-96 max-h-[65vh] flex flex-col shadow-2xl border border-border/50 glass">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="size-4 text-primary" />
              </div>
              <span>Asistente Repote</span>
              {loading && <Loader2 className="size-3.5 text-muted-foreground animate-spin ml-auto" />}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-3 flex-1 overflow-y-auto max-h-[45vh] space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-tr-md'
                      : 'bg-secondary/80 rounded-tl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 pt-2 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre FRP, flasheo..."
                disabled={loading}
                className="flex-1 bg-secondary/30 border-0 h-10 rounded-xl"
              />
              <Button
                size="icon"
                onClick={listening ? stopListening : startListening}
                variant={listening ? 'destructive' : 'outline'}
                className="size-10 rounded-xl"
              >
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              <Button size="icon" onClick={() => sendMessage()} disabled={loading || !input.trim()} className="size-10 rounded-xl">
                <Send className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Wrench className="size-3" />FRP</span>
              <span className="flex items-center gap-1"><MonitorSmartphone className="size-3" />Pantallas</span>
              <span className="flex items-center gap-1"><Zap className="size-3" />Flasheo</span>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
