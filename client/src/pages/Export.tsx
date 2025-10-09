import DataExport from "@/components/DataExport"

export default function Export() {
  const handleExportCSV = () => {
    console.log("CSV export initiated")
    // TODO: Remove mock functionality - implement actual data export
  }

  const handleExportJSON = () => {
    console.log("JSON export initiated")
    // TODO: Remove mock functionality - implement actual data export
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">
          Export your learning data for analysis and backup
        </p>
      </div>

      {/* Export Component */}
      <div className="max-w-2xl">
        <DataExport
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />
      </div>
    </div>
  )
}