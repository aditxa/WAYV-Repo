import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Usb, Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react"

interface ConnectionStatusProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export default function ConnectionStatus({ onConnect, onDisconnect, className }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [port, setPort] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const connectToSerial = async () => {
    if (!("serial" in navigator)) {
      setError("Web Serial API not supported in this browser")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request port access
      const selectedPort = await (navigator as any).serial.requestPort()
      await selectedPort.open({ baudRate: 9600 })
      
      setPort(selectedPort)
      setIsConnected(true)
      onConnect?.()
      
      console.log("Connected to WAYV device successfully")
    } catch (err: any) {
      setError(err.message || "Failed to connect to device")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    if (port) {
      try {
        await port.close()
        setPort(null)
        setIsConnected(false)
        onDisconnect?.()
        console.log("Disconnected from WAYV device")
      } catch (err: any) {
        setError(err.message || "Failed to disconnect")
      }
    }
  }

  const getStatusIcon = () => {
    if (isConnecting) return <Wifi className="h-4 w-4 animate-pulse" />
    if (isConnected) return <CheckCircle2 className="h-4 w-4" />
    if (error) return <AlertCircle className="h-4 w-4" />
    return <WifiOff className="h-4 w-4" />
  }

  const getStatusColor = () => {
    if (isConnecting) return "default"
    if (isConnected) return "default" // Using success-like styling
    if (error) return "destructive"
    return "secondary"
  }

  const getStatusText = () => {
    if (isConnecting) return "Connecting..."
    if (isConnected) return "Connected"
    if (error) return "Error"
    return "Disconnected"
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Usb className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">WAYV Device</span>
                <Badge variant={getStatusColor()} className="gap-1">
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </div>
              {error && (
                <p className="text-xs text-destructive mt-1" data-testid="error-message">
                  {error}
                </p>
              )}
              {isConnected && (
                <p className="text-xs text-muted-foreground mt-1">
                  Serial port connected at 9600 baud
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                onClick={connectToSerial}
                disabled={isConnecting || !("serial" in navigator)}
                size="sm"
                data-testid="button-connect"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <Button 
                onClick={disconnect}
                variant="outline"
                size="sm"
                data-testid="button-disconnect"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}