import DataExport from '../DataExport'

export default function DataExportExample() {
  return (
    <DataExport
      onExportCSV={() => console.log('CSV export requested')}
      onExportJSON={() => console.log('JSON export requested')}
    />
  )
}