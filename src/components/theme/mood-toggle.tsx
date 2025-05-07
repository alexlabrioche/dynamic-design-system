import { Flower2Icon, SparkleIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useThemeStore } from '@/store/theme-store'

export function MoodToggle() {
  const { mood, toggleMood } = useThemeStore()
  const isIntenseMood = mood === 'intense'

  return (
    <div className="flex items-center space-x-2">
      <Flower2Icon className="size-4 text-muted-foreground" />
      <Switch
        id="theme-toggle"
        checked={isIntenseMood}
        onCheckedChange={toggleMood}
        aria-label="Toggle mood"
      />
      <SparkleIcon className="size-4 text-muted-foreground" />
    </div>
  )
}
