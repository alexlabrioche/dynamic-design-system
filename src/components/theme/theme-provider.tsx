import { useEffect } from 'react'
import { useThemeStore } from '@/store/theme-store'

type Token = {
  name: string
  lightMode: {
    base: { l: number; c: number }
    foreground: { l: number; c: number }
  }
  darkMode: {
    base: { l: number; c: number }
    foreground: { l: number; c: number }
  }
}

const themeTokens = {
  intense: [
    {
      name: 'primary',
      lightMode: {
        base: { l: 0.55, c: 0.27 },
        foreground: { l: 0.98, c: 0.01 },
      },
      darkMode: {
        base: { l: 0.65, c: 0.27 },
        foreground: { l: 0.15, c: 0.03 },
      },
    },
    {
      name: 'secondary',
      lightMode: {
        base: { l: 0.92, c: 0.03 },
        foreground: { l: 0.25, c: 0.12 },
      },
      darkMode: {
        base: { l: 0.25, c: 0.08 },
        foreground: { l: 0.95, c: 0.02 },
      },
    },
    {
      name: 'accent',
      lightMode: {
        base: { l: 0.65, c: 0.18 },
        foreground: { l: 0.15, c: 0.07 },
      },
      darkMode: {
        base: { l: 0.7, c: 0.22 },
        foreground: { l: 0.98, c: 0.03 },
      },
    },
    {
      name: 'card',
      lightMode: {
        base: { l: 0.98, c: 0.01 },
        foreground: { l: 0.15, c: 0.02 },
      },
      darkMode: {
        base: { l: 0.1, c: 0.1 },
        foreground: { l: 0.95, c: 0.02 },
      },
    },
    {
      name: 'muted',
      lightMode: {
        base: { l: 0.9, c: 0.05 },
        foreground: { l: 0.45, c: 0.12 },
      },
      darkMode: {
        base: { l: 0.25, c: 0.07 },
        foreground: { l: 0.75, c: 0.1 },
      },
    },
  ],
  vintage: [
    {
      name: 'primary',
      lightMode: {
        base: { l: 0.62, c: 0.1 },
        foreground: { l: 0.95, c: 0.01 },
      },
      darkMode: {
        base: { l: 0.6, c: 0.09 },
        foreground: { l: 0.2, c: 0.01 },
      },
    },
    {
      name: 'secondary',
      lightMode: {
        base: { l: 0.94, c: 0.02 },
        foreground: { l: 0.3, c: 0.06 },
      },
      darkMode: {
        base: { l: 0.28, c: 0.04 },
        foreground: { l: 0.92, c: 0.01 },
      },
    },
    {
      name: 'accent',
      lightMode: {
        base: { l: 0.7, c: 0.09 },
        foreground: { l: 0.22, c: 0.03 },
      },
      darkMode: {
        base: { l: 0.65, c: 0.11 },
        foreground: { l: 0.95, c: 0.01 },
      },
    },
    {
      name: 'card',
      lightMode: {
        base: { l: 0.97, c: 0.02 },
        foreground: { l: 0.2, c: 0.01 },
      },
      darkMode: {
        base: { l: 0.15, c: 0.04 },
        foreground: { l: 0.92, c: 0.01 },
      },
    },
    {
      name: 'muted',
      lightMode: {
        base: { l: 0.93, c: 0.02 },
        foreground: { l: 0.5, c: 0.05 },
      },
      darkMode: {
        base: { l: 0.32, c: 0.03 },
        foreground: { l: 0.68, c: 0.04 },
      },
    },
  ],
}

function applyTheme(tokens: Array<Token>, hue: number, isDarkMode: boolean) {
  const root = document.documentElement
  const mode = isDarkMode ? 'darkMode' : 'lightMode'
  const accentHue = (hue + 180) % 360

  tokens.forEach((token) => {
    const tokenHue = token.name === 'accent' ? accentHue : hue

    root.style.setProperty(
      `--${token.name}`,
      `oklch(${token[mode].base.l} ${token[mode].base.c} ${tokenHue})`,
    )

    root.style.setProperty(
      `--${token.name}-foreground`,
      `oklch(${token[mode].foreground.l} ${token[mode].foreground.c} ${tokenHue})`,
    )
  })
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, hue, mood } = useThemeStore()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    const tokens = themeTokens[mood]
    applyTheme(tokens, hue, isDarkMode)

    root.setAttribute('data-theme', theme)
  }, [mood, theme, hue, isDarkMode])

  return <>{children}</>
}
