import { apiService } from './api'

export type DriveItemType = 'file' | 'folder'

export interface DriveItem {
  id: string
  name: string
  mimeType: string
  type: DriveItemType
  parents?: string[]
  webViewLink?: string
}

class GoogleDriveService {
  async listChildren(): Promise<DriveItem[]> {
    console.log('listChildren')
    const url = '/drive/list'
    const res = await apiService.axiosInstance.get(url)
    console.log('res', res)
    return res.data?.data || []
  }

  async getItem(itemId: string): Promise<DriveItem | null> {
    const res = await apiService.axiosInstance.get(`/drive/list/${itemId}`)
    return res.data?.data || null
  }

  getPreviewUrl(item: DriveItem): string | null {
    console.log('getPreviewUrl', item)
    if (item.webViewLink) { console.log('item.webViewLink', `localhost:3002/drive/file/${item.id}`); return `https://drive.google.com/file/d/${item.id}/preview` }
    
    //if (item.webViewLink) { console.log('item.webViewLink', item.webViewLink); return `https://drive.google.com/file/d/${item.id}/preview` }
    if (item.mimeType?.startsWith('image/')) { console.log('item.mimeType?.startsWith(image/)', item.mimeType); return `/api/proxy/google/drive/file/${item.id}` }
    if (item.mimeType === 'application/pdf') { console.log('item.mimeType === application/pdf', item.mimeType); return `https://drive.google.com/file/d/${item.id}/preview` }
    return null
  }
}

export const googleDriveService = new GoogleDriveService()
export default googleDriveService


