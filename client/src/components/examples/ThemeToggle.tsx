import { ThemeProvider } from '../ThemeProvider'
import ThemeToggle from '../ThemeToggle'

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4 border rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme Toggle</span>
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}