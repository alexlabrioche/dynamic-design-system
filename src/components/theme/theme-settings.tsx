import { Link, useLocation } from '@tanstack/react-router'
import { HueSlider } from './hue-slider'
import { MoodToggle } from './mood-toggle'
import { ThemeToggle } from './theme-toggle'

export function ThemeSettings() {
  const location = useLocation()
  const isCardPage = location.pathname === '/'

  return (
    <header className="fixed flex flex-col gap-6 top-1/2 -translate-y-1/2 right-4 p-2 rounded-md shadow-lg bg-background/25">
      {isCardPage && (
        <>
          <div className="grid grid-cols-1 gap-2 font-bold text-xs">
            <div className="py-1 px-4 bg-primary text-primary-foreground rounded-md">
              Primary
            </div>
            <div className="py-1 px-4 bg-secondary text-secondary-foreground rounded-md">
              Secondary
            </div>
            <div className="py-1 px-4 bg-accent text-accent-foreground rounded-md">
              Accent
            </div>
            <div className="py-1 px-4 bg-muted text-muted-foreground rounded-md">
              Muted
            </div>
            <div className="py-1 px-4 bg-card text-card-foreground rounded-md">
              Card
            </div>
          </div>
          <HueSlider />
        </>
      )}
      <div className="grid place-items-center gap-2">
        <ThemeToggle />
        <MoodToggle />
      </div>
      <div className="flex flex-col mt-6">
        <Link to="/" className="text-primary hover:underline">
          Dynamic card
        </Link>
        <Link to="/shade-generator" className="text-primary hover:underline">
          Theme generator
        </Link>
        <Link to="/gradient" className="text-primary hover:underline">
          Gradient
        </Link>
      </div>
    </header>
  )
}
