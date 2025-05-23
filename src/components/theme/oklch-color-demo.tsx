import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const SHADES = [-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4]

function oklchToOklab(L: number, C: number, h: number) {
  const hRad = (h * Math.PI) / 180
  return {
    L: L,
    a: C * Math.cos(hRad),
    b: C * Math.sin(hRad),
  }
}

function oklabToLinearRgb(L: number, a: number, b: number) {
  const l = L + 0.3963377774 * a + 0.2158037573 * b
  const m = L - 0.1055613458 * a - 0.0638541728 * b
  const s = L - 0.0894841775 * a - 1.291485548 * b

  const l3 = l ** 3
  const m3 = m ** 3
  const s3 = s ** 3

  return {
    r: +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  }
}

function linearRgbToRgb(r: number, g: number, b: number) {
  const gammaCorrect = (c: number) => {
    const abs = Math.abs(c)
    if (abs > 0.0031308) {
      return Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055)
    } else {
      return 12.92 * c
    }
  }

  return {
    r: gammaCorrect(r),
    g: gammaCorrect(g),
    b: gammaCorrect(b),
  }
}

function isInGamut(r: number, g: number, b: number, tolerance = 0.000005) {
  return (
    r >= -tolerance &&
    r <= 1 + tolerance &&
    g >= -tolerance &&
    g <= 1 + tolerance &&
    b >= -tolerance &&
    b <= 1 + tolerance
  )
}

function gamutMapOklch(L: number, C: number, h: number) {
  if (L <= 0 || L >= 1) {
    return { L: Math.max(0, Math.min(1, L)), C: 0, h }
  }

  const oklab = oklchToOklab(L, C, h)
  const linearRgb = oklabToLinearRgb(oklab.L, oklab.a, oklab.b)
  const rgb = linearRgbToRgb(linearRgb.r, linearRgb.g, linearRgb.b)

  if (isInGamut(rgb.r, rgb.g, rgb.b)) {
    return { L, C, h }
  }

  let chromaMin = 0
  let chromaMax = C
  let bestChroma = 0

  for (let i = 0; i < 20; i++) {
    const testChroma = (chromaMin + chromaMax) / 2

    const testOklab = oklchToOklab(L, testChroma, h)
    const testLinearRgb = oklabToLinearRgb(
      testOklab.L,
      testOklab.a,
      testOklab.b,
    )
    const testRgb = linearRgbToRgb(
      testLinearRgb.r,
      testLinearRgb.g,
      testLinearRgb.b,
    )

    if (isInGamut(testRgb.r, testRgb.g, testRgb.b)) {
      bestChroma = testChroma
      chromaMin = testChroma
    } else {
      chromaMax = testChroma
    }
  }

  return { L, C: bestChroma, h }
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function oklchToRgb(L: number, C: number, h: number) {
  const mapped = gamutMapOklch(L, C, h)
  const oklab = oklchToOklab(mapped.L, mapped.C, mapped.h)
  const linearRgb = oklabToLinearRgb(oklab.L, oklab.a, oklab.b)
  const rgb = linearRgbToRgb(linearRgb.r, linearRgb.g, linearRgb.b)

  return {
    r: Math.round(clamp(rgb.r) * 255),
    g: Math.round(clamp(rgb.g) * 255),
    b: Math.round(clamp(rgb.b) * 255),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (c: number) => {
    const hex = c.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function oklchToHex(L: number, C: number, h: number) {
  const rgb = oklchToRgb(L, C, h)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToLinearRgb(r: number, g: number, b: number) {
  const srgbToLinear = (c: number) => {
    c = c / 255
    if (c <= 0.04045) {
      return c / 12.92
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4)
    }
  }

  return {
    r: srgbToLinear(r),
    g: srgbToLinear(g),
    b: srgbToLinear(b),
  }
}

function linearRgbToOklab(r: number, g: number, b: number) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  }
}

function oklabToOklch(L: number, a: number, b: number) {
  const C = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360

  return {
    L: L,
    C: C,
    h: h,
  }
}

function hexToOklch(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const linearRgb = rgbToLinearRgb(rgb.r, rgb.g, rgb.b)
  const oklab = linearRgbToOklab(linearRgb.r, linearRgb.g, linearRgb.b)
  const oklch = oklabToOklch(oklab.L, oklab.a, oklab.b)

  return oklch
}

export function OklchColorDemo() {
  const [hue, setHue] = useState(169)
  const [chroma, setChroma] = useState(0.19)
  const [lightness, setLightness] = useState(0.55)
  const [rgbColor, setRgbColor] = useState('')
  const [hexInput, setHexInput] = useState('')

  useEffect(() => {
    try {
      const rgb = oklchToRgb(lightness, chroma, hue)
      const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
      const hexString = oklchToHex(lightness, chroma, hue)

      setRgbColor(rgbString)
      setHexInput(hexString)
    } catch (error) {
      console.error('Erreur lors de la conversion OKLCH → RGB:', error)
      setRgbColor('Conversion impossible')
    }
  }, [lightness, chroma, hue])

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHue(Number(e.target.value))
  }

  const handleChromaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChroma(Number(e.target.value))
  }

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLightness(Number(e.target.value))
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexValue = e.target.value
    setHexInput(hexValue)

    if (hexValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      const oklch = hexToOklch(hexValue)
      if (oklch) {
        setLightness(oklch.L)
        setChroma(oklch.C)
        setHue(oklch.h)
      }
    }
  }

  const createColorString = (l: number, c: number, h: number) => {
    try {
      const rgb = oklchToRgb(l, c, h)
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    } catch {
      return `oklch(${l} ${c} ${h})`
    }
  }

  const hueSliderBackground = `linear-gradient(
    to right,
    ${createColorString(lightness, chroma, 0)},
    ${createColorString(lightness, chroma, 60)},
    ${createColorString(lightness, chroma, 120)},
    ${createColorString(lightness, chroma, 180)},
    ${createColorString(lightness, chroma, 240)},
    ${createColorString(lightness, chroma, 300)},
    ${createColorString(lightness, chroma, 360)}
  )`

  const chromaSliderBackground = `linear-gradient(
    to right,
    ${createColorString(lightness, 0, hue)},
    ${createColorString(lightness, 0.05, hue)},
    ${createColorString(lightness, 0.1, hue)},
    ${createColorString(lightness, 0.15, hue)},
    ${createColorString(lightness, 0.2, hue)},
    ${createColorString(lightness, 0.25, hue)},
    ${createColorString(lightness, 0.3, hue)}
  )`

  const lightnessSliderBackground = `linear-gradient(
    to right,
    ${createColorString(0, chroma, hue)},
    ${createColorString(0.2, chroma, hue)},
    ${createColorString(0.4, chroma, hue)},
    ${createColorString(0.6, chroma, hue)},
    ${createColorString(0.8, chroma, hue)},
    ${createColorString(1.0, chroma, hue)}
  )`

  return (
    <div className="w-full max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="hue-slider">Teinte (Hue)</Label>
              <span className="text-muted-foreground">{hue}°</span>
            </div>
            <Input
              id="hue-slider"
              type="range"
              min="0"
              max="360"
              step="1"
              value={hue}
              onChange={handleHueChange}
              className="w-full h-5 appearance-none rounded-md"
              style={{
                background: hueSliderBackground,
                cursor: 'pointer',
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="chroma-slider">Chroma (Saturation)</Label>
              <span className="text-muted-foreground">{chroma.toFixed(2)}</span>
            </div>
            <Input
              id="chroma-slider"
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={chroma}
              onChange={handleChromaChange}
              className="w-full h-5 appearance-none rounded-md"
              style={{
                background: chromaSliderBackground,
                cursor: 'pointer',
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="lightness-slider">Luminosité (Lightness)</Label>
              <span className="text-muted-foreground">
                {lightness.toFixed(2)}
              </span>
            </div>
            <Input
              id="lightness-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={lightness}
              onChange={handleLightnessChange}
              className="w-full h-5 appearance-none rounded-md"
              style={{
                background: lightnessSliderBackground,
                cursor: 'pointer',
              }}
            />
          </div>
        </Card>

        <Card className="p-6 h-full">
          <div className="space-y-6 h-full">
            <div
              className="w-full h-32 rounded-md border"
              style={{
                backgroundColor: rgbColor,
              }}
            />
            <div className="space-y-2">
              <Input
                id="hex-input"
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                placeholder="#000000"
                className="w-full font-mono"
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 flex flex-col gap-2">
        {SHADES.map((shade) => {
          const adjustedLightness = Math.max(0, Math.min(1, lightness + shade))
          const shadeColor = createColorString(adjustedLightness, chroma, hue)
          return (
            <div
              key={shade}
              className="w-full flex justify-between rounded-md text-sm font-bold p-2"
              style={{
                backgroundColor: shadeColor,
                color: adjustedLightness > 0.6 ? '#000' : '#fff',
              }}
            >
              <span>
                oklch({adjustedLightness.toFixed(2)} {chroma.toFixed(2)} {hue})
              </span>
              <span>{oklchToHex(adjustedLightness, chroma, hue)}</span>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
