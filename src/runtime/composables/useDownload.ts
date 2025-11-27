import { sanitizeFilename } from '../lib/sanitize'

/**
 * Composable for file download utilities
 */
export function useDownload () {
  /**
   * Downloads a blob as a file
   */
  const downloadFile = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Generates a filename with timestamp
   * @param entityType - Type of entity (e.g., 'stops', 'routes')
   * @param extension - File extension (e.g., 'csv', 'json', 'geojson')
   */
  const getFilename = (entityType: string, extension: string): string => {
    const timestamp = new Date().toISOString().split('T')[0]
    return sanitizeFilename(`${entityType}-${timestamp}.${extension}`)
  }

  /**
   * Downloads data as JSON
   */
  const downloadAsJSON = (data: any, entityType: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadFile(blob, getFilename(entityType, 'json'))
  }

  /**
   * Downloads data as GeoJSON FeatureCollection
   */
  const downloadAsGeoJSON = (features: any[], entityType: string): void => {
    const featureCollection = {
      type: 'FeatureCollection' as const,
      features
    }
    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/json' })
    downloadFile(blob, getFilename(entityType, 'geojson'))
  }

  return {
    downloadFile,
    getFilename,
    downloadAsJSON,
    downloadAsGeoJSON
  }
}
