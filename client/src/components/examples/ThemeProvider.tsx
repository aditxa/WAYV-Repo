import { ThemeProvider } from '../ThemeProvider'
import { Button } from '@/components/ui/button'

function ThemeDemo() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Theme Provider Demo</h3>
      <div className="space-y-2">
        <p className="text-muted-foreground">Theme provider is active and ready for use</p>
        <Button>Sample Button</Button>
      </div>
    </div>
  )
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <ThemeDemo />
    </ThemeProvider>
  )
}