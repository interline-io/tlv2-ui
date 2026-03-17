import { sanitizeFilename } from '../lib/util/sanitize'

export interface DownloadOptions {
  filename: string
  data: string | Blob
  mimeType: string
}

export function useDownload () {
  const download = ({ filename, data, mimeType }: DownloadOptions): void => {
    const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data
    const a = document.createElement('a')

    a.download = sanitizeFilename(filename)
    a.href = window.URL.createObjectURL(blob)
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(a.href)
  }

  return {
    download
  }
}
