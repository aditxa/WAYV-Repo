import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Database, Calendar } from "lucide-react"

interface ExportData {
  sessionId: string
  totalSessions: number
  totalAttempts: number
  avgAccuracy: number
  lastSession: Date
}

interface DataExportProps {
  exportData?: ExportData
  onExportCSV?: () => void
  onExportJSON?: () => void
  className?: string
}

export default function DataExport({ 
  exportData, 
  onExportCSV, 
  onExportJSON, 
  className 
}: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  // TODO: Remove mock functionality - replace with real export data
  const mockData: ExportData = {
    sessionId: "wayv_session_" + Date.now(),
    totalSessions: 15,
    totalAttempts: 342,
    avgAccuracy: 84.5,
    lastSession: new Date(Date.now() - 1800000) // 30 minutes ago
  }

  const currentData = exportData || mockData

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // TODO: Remove mock functionality - implement real CSV export
      console.log("Exporting CSV data...")
      
      // Mock CSV generation
      const csvData = `SessionID,Timestamp,Mode,Accuracy,Latency,Attempts,Errors
${currentData.sessionId},${new Date().toISOString()},learning,85.2,1500,25,"q:2;w:1"
${currentData.sessionId},${new Date(Date.now() - 300000).toISOString()},practice,91.8,1200,30,"p:1"`

      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wayv_data_${currentData.sessionId}.csv`
      a.click()
      URL.revokeObjectURL(url)
      
      onExportCSV?.()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      // TODO: Remove mock functionality - implement real JSON export
      console.log("Exporting JSON data...")
      
      const jsonData = {
        sessionId: currentData.sessionId,
        exportTimestamp: new Date().toISOString(),
        summary: {
          totalSessions: currentData.totalSessions,
          totalAttempts: currentData.totalAttempts,
          averageAccuracy: currentData.avgAccuracy,
          lastSession: currentData.lastSession.toISOString()
        },
        sessions: [
          {
            timestamp: new Date().toISOString(),
            mode: "learning",
            accuracy: 85.2,
            latency: 1500,
            attempts: 25,
            errors: { q: 2, w: 1 }
          }
        ]
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wayv_data_${currentData.sessionId}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      onExportJSON?.()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Summary */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Current Session Data</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Sessions</div>
              <div className="text-xl font-bold" data-testid="total-sessions">
                {currentData.totalSessions}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Attempts</div>
              <div className="text-xl font-bold" data-testid="total-attempts">
                {currentData.totalAttempts}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              <div className="text-xl font-bold text-chart-2" data-testid="avg-accuracy">
                {currentData.avgAccuracy.toFixed(1)}%
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Last Session</div>
              <div className="text-sm" data-testid="last-session">
                {currentData.lastSession.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Export Formats</div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleExportCSV}
              disabled={isExporting}
              variant="outline"
              className="w-full justify-start gap-3"
              data-testid="button-export-csv"
            >
              <FileText className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-muted-foreground">
                  Spreadsheet format for data analysis
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button 
              onClick={handleExportJSON}
              disabled={isExporting}
              variant="outline"
              className="w-full justify-start gap-3"
              data-testid="button-export-json"
            >
              <Database className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-muted-foreground">
                  Structured data for developers
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Export Info */}
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Export Information</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• CSV format includes session details, accuracy metrics, and error patterns</p>
            <p>• JSON format provides structured data with metadata and session summaries</p>
            <p>• All exports include timestamp and session ID for tracking</p>
          </div>
        </div>

        {isExporting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span>Preparing export...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}