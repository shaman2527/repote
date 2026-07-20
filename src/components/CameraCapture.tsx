import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
  onCapture: (base64: string) => void
  disabled?: boolean
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      setActive(true)
    } catch {
      alert('No se pudo acceder a la cámara')
    }
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setActive(false)
  }, [stream])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const data = canvas.toDataURL('image/jpeg', 0.8)
    setPhoto(data)
    onCapture(data)
    stopCamera()
  }, [onCapture, stopCamera])

  const retake = useCallback(() => {
    setPhoto(null)
    startCamera()
  }, [startCamera])

  return (
    <div className="space-y-2">
      {!active && !photo && (
        <Button type="button" variant="outline" onClick={startCamera} disabled={disabled} className="w-full">
          📸 Tomar Foto
        </Button>
      )}
      {active && (
        <div className="space-y-2">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border" />
          <div className="flex gap-2">
            <Button type="button" onClick={takePhoto}>Capturar</Button>
            <Button type="button" variant="ghost" onClick={stopCamera}>Cancelar</Button>
          </div>
        </div>
      )}
      {photo && (
        <div className="space-y-2">
          <img src={photo} alt="Foto del equipo" className="w-full rounded-lg border" />
          <Button type="button" variant="outline" size="sm" onClick={retake}>Retomar Foto</Button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
