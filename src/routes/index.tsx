import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ThemeSettings } from '@/components/theme'
import { useRandomPoem } from '@/hooks/use-random-poem'
import { useRandomImage } from '@/hooks/use-random-image'
import { useThemeStore } from '@/store/theme-store'
import { Card } from '@/components/card'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const poem = useRandomPoem()
  const image = useRandomImage()
  const { setHue } = useThemeStore()

  const onGenerateNewCard = () => {
    poem.fetchRandomPoem()
    image.fetchRandomImage()
  }

  useEffect(() => {
    if (image.data) {
      const { hue } = image.data
      setHue(hue)
    }
  }, [image.data, setHue])

  if (poem.loading || image.loading)
    return (
      <div className="h-screen w-screen grid place-items-center">
        Loading...
      </div>
    )
  if (!image.data || !poem.data) return <div>ERROR</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card
        image={image.data}
        poem={poem.data}
        onGenerateNewCard={onGenerateNewCard}
      />
      <ThemeSettings />
    </div>
  )
}
