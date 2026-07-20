import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (typeof WebGLRenderingContext === 'undefined') return

    let animId: number
    let webglOk = false
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      webglOk = !!gl
    } catch { webglOk = false }
    if (!webglOk) return

    try {
      const width = container.clientWidth
      const height = container.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      const particleCount = 120
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 25
        positions[i * 3 + 1] = (Math.random() - 0.5) * 25
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        color: 0x3b82f6,
        size: 0.08,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })

      const particles = new THREE.Points(geometry, material)
      scene.add(particles)

      const linePositions: number[] = []
      for (let i = 0; i < 25; i++) {
        const a = Math.floor(Math.random() * particleCount)
        const b = Math.floor(Math.random() * particleCount)
        linePositions.push(
          positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
          positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2],
        )
      }

      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.04 })
      const lines = new THREE.LineSegments(lineGeo, lineMat)
      scene.add(lines)

      camera.position.z = 12

      let mouseX = 0
      let mouseY = 0
      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / width - 0.5) * 0.8
        mouseY = (e.clientY / height - 0.5) * 0.8
      }
      window.addEventListener('mousemove', onMouseMove)

      const animate = () => {
        animId = requestAnimationFrame(animate)
        particles.rotation.y += 0.0008
        particles.rotation.x += 0.0003
        lines.rotation.copy(particles.rotation)
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.015
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.015
        camera.lookAt(scene.position)
        renderer.render(scene, camera)
      }

      animate()

      const handleResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', handleResize)
        try { renderer.dispose() } catch {}
        try { if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement) } catch {}
      }
    } catch (e) {
      console.warn('ThreeBackground error:', e)
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 -z-10 opacity-30" />
}
