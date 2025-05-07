import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'
type Mood = 'intense' | 'vintage'
interface ThemeState {
  theme: Theme
  mood: Mood
  hue: number
  setHue: (hue: number) => void
  setTheme: (theme: Theme) => void
  toggleMood: () => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      mood: 'intense',
      hue: 0,
      setHue: (hue: number) => set({ hue }),
      setTheme: (theme: Theme) => set({ theme }),
      toggleMood: () =>
        set((state) => ({
          mood: state.mood === 'intense' ? 'vintage' : 'intense',
        })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'theme-storage',
    },
  ),
)
