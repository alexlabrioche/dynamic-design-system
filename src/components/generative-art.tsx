import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface GradientCell {
  id: number
  direction: number
}

interface ArtworkColors {
  color1: string
  color2: string
}

function generateOppositeColors(): ArtworkColors {
  const hue1 = Math.floor(Math.random() * 360)
  const hue2 = (hue1 + 180) % 360

  const saturation = 70 + Math.random() * 30
  const lightness = 40 + Math.random() * 20

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100
    const a = (s * Math.min(l, 1 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  return {
    color1: hslToHex(hue1, saturation, lightness),
    color2: hslToHex(hue2, saturation, lightness),
  }
}

function generateRandomDirection(): number {
  const directions = [0, 45, 90, 180]
  return directions[Math.floor(Math.random() * directions.length)]
}

function generateGrid(size: number): Array<GradientCell> {
  return Array.from({ length: size * size }, (_, index) => ({
    id: index,
    direction: generateRandomDirection(),
  }))
}

export default function GenerativeGradientArt() {
  const [useOklchInterpolation, setUseOklchInterpolation] = useState(false)
  const [gridSize] = useState(8)
  const [cells, setCells] = useState(() => generateGrid(gridSize))
  const [artworkColors, setArtworkColors] = useState(() =>
    generateOppositeColors(),
  )
  const [dragState, setDragState] = useState<{
    dragging: 'color1' | 'color2' | null
    startAngle: number
  }>({ dragging: null, startAngle: 0 })

  const wheelRef = useRef<HTMLDivElement>(null)

  const regenerateArt = useCallback(() => {
    setCells(generateGrid(gridSize))
    setArtworkColors(generateOppositeColors())
  }, [gridSize])

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0

    if (max !== min) {
      const d = max - min
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return h * 360
  }

  // Convertir HSL vers hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100
    const a = (s * Math.min(l, 1 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const getAngleFromMouse = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0

    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY

    let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI
    angle = (angle + 90 + 360) % 360

    return angle
  }

  const getPointPosition = (hue: number) => {
    const radius = 35
    const angleRad = ((hue - 90) * Math.PI) / 180

    return {
      x: 50 + radius * Math.cos(angleRad),
      y: 50 + radius * Math.sin(angleRad),
    }
  }

  const handleMouseDown = (
    e: React.MouseEvent,
    colorKey: 'color1' | 'color2',
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const currentAngle = getAngleFromMouse(e.clientX, e.clientY)
    setDragState({
      dragging: colorKey,
      startAngle: currentAngle,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.dragging) return

      const angle = getAngleFromMouse(e.clientX, e.clientY)
      const newColor = hslToHex(angle, 80, 60)

      setArtworkColors((prev) => ({
        ...prev,
        [dragState.dragging!]: newColor,
      }))
    }

    const handleMouseUp = () => {
      setDragState({ dragging: null, startAngle: 0 })
    }

    if (dragState.dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState.dragging])

  const getGradientStyle = (cell: GradientCell) => {
    const interpolation = useOklchInterpolation ? 'in oklch ' : ''
    return {
      background: `linear-gradient(${interpolation}${cell.direction}deg, ${artworkColors.color1}, ${artworkColors.color2})`,
    }
  }

  const hue1 = hexToHsl(artworkColors.color1)
  const hue2 = hexToHsl(artworkColors.color2)
  const pos1 = getPointPosition(hue1)
  const pos2 = getPointPosition(hue2)

  let angleDiff = hue2 - hue1
  if (angleDiff > 180) angleDiff -= 360
  if (angleDiff < -180) angleDiff += 360
  const largeArc = Math.abs(angleDiff) > 180 ? 1 : 0
  const sweep = angleDiff > 0 ? 1 : 0

  return (
    <div className="flex items-center gap-4 justify-center min-h-screen p-4">
      <div className="mx-auto space-y-6">
        <div
          className="flex-none w-full grid mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${Math.min(900, gridSize * 50)}px`,
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.id}
              className="aspect-square"
              style={getGradientStyle(cell)}
            />
          ))}
        </div>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="oklch-interpolation"
                checked={useOklchInterpolation}
                onCheckedChange={setUseOklchInterpolation}
              />
              <Label htmlFor="oklch-interpolation" className="font-medium">
                {useOklchInterpolation
                  ? 'Interpolation OKLCH'
                  : 'Interpolation RGB'}
              </Label>
            </div>

            <div className="flex gap-4">
              <Button onClick={regenerateArt} variant="outline">
                🎲 Générer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              ref={wheelRef}
              className="w-full aspect-square border border-gray-300 rounded-full relative overflow-hidden select-none"
              style={{
                background: `conic-gradient(from 0deg,
                  hsl(0, 80%, 60%),    /* Rouge */
                  hsl(60, 80%, 60%),   /* Jaune */
                  hsl(120, 80%, 60%),  /* Vert */
                  hsl(180, 80%, 60%),  /* Cyan */
                  hsl(240, 80%, 60%),  /* Bleu */
                  hsl(300, 80%, 60%),  /* Magenta */
                  hsl(0, 80%, 60%)     /* Rouge */
                )`,
              }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
              >
                <path
                  d={`M ${pos1.x} ${pos1.y} A 35 35 0 ${largeArc} ${sweep} ${pos2.x} ${pos2.y}`}
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="2,2"
                />
              </svg>

              <div
                className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg cursor-grab hover:scale-110 transition-transform"
                style={{
                  backgroundColor: artworkColors.color1,
                  left: `${pos1.x}%`,
                  top: `${pos1.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: dragState.dragging === 'color1' ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'color1')}
              />
              <div
                className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg cursor-grab hover:scale-110 transition-transform"
                style={{
                  backgroundColor: artworkColors.color2,
                  left: `${pos2.x}%`,
                  top: `${pos2.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: dragState.dragging === 'color2' ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'color2')}
              />
            </div>

            <div
              className="w-full aspect-square border border-gray-300 rounded relative"
              style={{
                background: `
                  linear-gradient(to right, ${artworkColors.color1}, white),
                  linear-gradient(to bottom, transparent, ${artworkColors.color2})
                `,
                backgroundBlendMode: 'multiply',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-black/20 transform rotate-45 origin-center"></div>
              </div>
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                style={{
                  backgroundColor: artworkColors.color1,
                  left: '8px',
                  top: '8px',
                }}
              />
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                style={{
                  backgroundColor: artworkColors.color2,
                  right: '8px',
                  bottom: '8px',
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
