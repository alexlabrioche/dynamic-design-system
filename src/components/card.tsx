import { Wand2Icon } from 'lucide-react'
import type { UnsplashImage } from '@/hooks/use-random-image'
import type { Poem } from '@/hooks/use-random-poem'
import { Button } from '@/components/ui/button'

interface CardProps {
  image: UnsplashImage
  poem: Poem
  onGenerateNewCard: () => void
}

export function Card({ image, poem, onGenerateNewCard }: CardProps) {
  return (
    <div className="relative w-2xl rounded-4xl overflow-hidden shadow-2xl bg-card">
      <div className="absolute inset-0 h-[25rem]">
        <div className="absolute bg-linear-to-t/oklch from-card to-transparent w-full h-full" />
        <img
          src={image.urls.regular}
          alt={image.alt_description || 'Random image from Unsplash'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative mt-72 p-6">
        <h2 className="text-5xl font-black text-primary">{poem.title}</h2>
        <div className="p-8 text-secondary-foreground">
          {poem.lines.slice(0, 10).map((line, index) => (
            <p key={index}>{line || <br />}</p>
          ))}
          {Number(poem.linecount) > 10 ? '...' : ''}
        </div>
        <p className="text-sm text-right mb-4 text-muted-foreground">
          <span className="font-medium text-accent">{image.theme}</span> photo
          by{' '}
          <a
            href={`${image.user.links.html}?utm_source=your_app_name&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {image.user.name}
          </a>
          , poem by{' '}
          <span className="font-medium text-accent">{poem.author}</span>
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onGenerateNewCard}
        >
          Generate New card
          <Wand2Icon className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
