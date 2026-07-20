import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Circuit board particles
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      colors[i * 3] = 0.23
      colors[i * 3 + 1] = 0.51
      colors[i * 3 + 2] = 0.96
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Connecting lines
    const linePositions: number[] = []
    for (let i = 0; i < 30; i++) {
      const idx = Math.floor(Math.random() * particleCount)
      const jdx = Math.floor(Math.random() * particleCount)
      linePositions.push(
        positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2],
        positions[jdx * 3], positions[jdx * 3 + 1], positions[jdx * 3 + 2],
      )
    }

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.08,
    })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lines)

    camera.position.z = 8

    let mouseX = 0
    let mouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2
      mouseY = (e.clientY / height - 0.5) * 2
    }

    window.addEventListener('mousemove', onMouseMove)

    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)

      particles.rotation.x += 0.0003
      particles.rotation.y += 0.0005
      lines.rotation.x = particles.rotation.x
      lines.rotation.y = particles.rotation.y

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02
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
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 -z-10 opacity-40" />
}
