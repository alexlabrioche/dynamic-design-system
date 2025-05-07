export async function getImageHue(src: string): Promise<{ hue: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const maxDimension = 250
        const scale = Math.min(
          maxDimension / img.width,
          maxDimension / img.height,
        )

        canvas.width = Math.floor(img.width * scale)
        canvas.height = Math.floor(img.height * scale)

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        const hue = extractDominantHue(pixels)

        console.log('Extracted hue:', hue)

        resolve({ hue })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = src
  })
}

function extractDominantHue(pixels: Uint8ClampedArray): number {
  const hueHistogram = new Array(360).fill(0)
  let totalPixelsAnalyzed = 0

  const colorGroups = {
    red: 0, // 0-30 & 330-360
    yellow: 0, // 30-90
    green: 0, // 90-150
    cyan: 0, // 150-210
    blue: 0, // 210-270
    magenta: 0, // 270-330
  }

  const colors: Array<{ r: number; g: number; b: number; count: number }> = []
  const colorMap = new Map<string, number>()

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    if (
      a < 128 ||
      (r < 20 && g < 20 && b < 20) ||
      (r > 235 && g > 235 && b > 235)
    ) {
      continue
    }

    const [h, s, l] = rgbToHsl(r, g, b)

    if (s > 0.08 && l > 0.15 && l < 0.85) {
      totalPixelsAnalyzed++

      const hueInDegrees = Math.floor(h * 360) % 360

      const saturationWeight = Math.pow(s, 1.2) // Reduced from 1.5
      const lightnessWeight = 1 - Math.abs(l - 0.5) * 1.5 // Favor mid-tones
      const weight = saturationWeight * lightnessWeight * 2

      hueHistogram[hueInDegrees] += weight

      // Count by color group for debug
      if (
        (hueInDegrees >= 0 && hueInDegrees < 30) ||
        (hueInDegrees >= 330 && hueInDegrees < 360)
      ) {
        colorGroups.red += weight
      } else if (hueInDegrees >= 30 && hueInDegrees < 90) {
        colorGroups.yellow += weight
      } else if (hueInDegrees >= 90 && hueInDegrees < 150) {
        colorGroups.green += weight
      } else if (hueInDegrees >= 150 && hueInDegrees < 210) {
        colorGroups.cyan += weight
      } else if (hueInDegrees >= 210 && hueInDegrees < 270) {
        colorGroups.blue += weight
      } else {
        colorGroups.magenta += weight
      }

      const binSize = 10
      const rBin = Math.floor(r / binSize) * binSize
      const gBin = Math.floor(g / binSize) * binSize
      const bBin = Math.floor(b / binSize) * binSize
      const colorKey = `${rBin},${gBin},${bBin}`

      if (colorMap.has(colorKey)) {
        const index = colorMap.get(colorKey)!
        colors[index].count++
      } else {
        colorMap.set(colorKey, colors.length)
        colors.push({ r: rBin, g: gBin, b: bBin, count: 1 })
      }
    }
  }

  let dominantHue: number

  const smoothedHistogram = smoothHistogram(hueHistogram, 15) // Reduced from 20

  let maxCount = 0
  let histogramDominantHue = 0

  for (let i = 0; i < smoothedHistogram.length; i++) {
    if (smoothedHistogram[i] > maxCount) {
      maxCount = smoothedHistogram[i]
      histogramDominantHue = i
    }
  }

  colors.sort((a, b) => b.count - a.count)

  const topColors = colors.slice(0, 5)

  let quantizationHue = 0
  if (topColors.length > 0) {
    const topColor = topColors[0]
    const [h] = rgbToHsl(topColor.r, topColor.g, topColor.b)
    quantizationHue = Math.floor(h * 360) % 360
    console.log('Top quantized color hue:', quantizationHue)
  }

  const histogramWeight = 0.4
  const quantizationWeight = 0.6

  const hueDifference = Math.min(
    Math.abs(histogramDominantHue - quantizationHue),
    360 - Math.abs(histogramDominantHue - quantizationHue),
  )

  if (hueDifference < 30) {
    dominantHue = Math.round(
      histogramDominantHue * histogramWeight +
        quantizationHue * quantizationWeight,
    )
  } else {
    const maxColorGroupValue = Math.max(...Object.values(colorGroups))
    const isVibrant = maxColorGroupValue > totalPixelsAnalyzed * 0.5

    dominantHue = isVibrant ? histogramDominantHue : quantizationHue
  }

  return dominantHue
}

function smoothHistogram(
  histogram: Array<number>,
  windowSize: number,
): Array<number> {
  const result = new Array(histogram.length).fill(0)
  const halfWindow = Math.floor(windowSize / 2)

  for (let i = 0; i < histogram.length; i++) {
    let sum = 0
    let count = 0

    for (let j = -halfWindow; j <= halfWindow; j++) {
      const index = (i + j + histogram.length) % histogram.length
      sum += histogram[index]
      count++
    }

    result[i] = sum / count
  }

  return result
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

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

  return [h, s, l]
}
