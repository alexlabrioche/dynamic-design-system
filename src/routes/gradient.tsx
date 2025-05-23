import { createFileRoute } from '@tanstack/react-router'
import GenerativeGradientArt from '@/components/generative-art'

export const Route = createFileRoute('/gradient')({
  component: GenerativeGradientArt,
})
