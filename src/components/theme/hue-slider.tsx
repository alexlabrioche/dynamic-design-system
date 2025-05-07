import React from 'react'
import { useThemeStore } from '@/store/theme-store'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function HueSlider({ className }: { className?: string }) {
  const { hue, setHue, theme } = useThemeStore()
  const isDark = theme === 'dark'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHue(Number(e.target.value))
  }

  const lightness = isDark ? 0.5 : 0.8
  const chroma = isDark ? 0.15 : 0.3
  const sliderBackground = `linear-gradient(
    to right,
    oklch(${lightness} ${chroma} 0),
    oklch(${lightness} ${chroma} 60),
    oklch(${lightness} ${chroma} 120),
    oklch(${lightness} ${chroma} 180),
    oklch(${lightness} ${chroma} 240),
    oklch(${lightness} ${chroma} 300),
    oklch(${lightness} ${chroma} 360)
  )`

  return (
    <div className={cn('flex flex-col space-y-2 max-w-full', className)}>
      <label
        htmlFor="hue-slider"
        className="text-sm font-medium flex justify-between"
      >
        <span className="text-muted-foreground">Hue: {hue}°</span>
      </label>

      <Input
        id="hue-slider"
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleChange}
        className="w-full h-5 appearance-none rounded-md"
        style={{
          background: sliderBackground,
          cursor: 'pointer',
        }}
      />
    </div>
  )
}
