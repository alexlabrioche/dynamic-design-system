import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useThemeStore } from '@/store/theme-store'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDarkMode = theme === 'dark'

  return (
    <div className="flex items-center space-x-2">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        id="theme-toggle"
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  )
}
