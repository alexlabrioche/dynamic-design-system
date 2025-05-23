import { createFileRoute } from '@tanstack/react-router'
import { OklchColorDemo } from '@/components/theme/oklch-color-demo'

export const Route = createFileRoute('/shade-generator')({
  component: OklchDemo,
})

function OklchDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <OklchColorDemo />
    </div>
  )
}
