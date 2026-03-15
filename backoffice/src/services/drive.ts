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
  /**
   * Liste les enfants d'un dossier (racine si parentId absent).
   * En cas d'erreur API (ex. 500), renvoie [] pour ne pas bloquer l'UI.
   */
  async listChildren(parentId?: string): Promise<DriveItem[]> {
    try {
      const params = parentId ? { parentId } : {}
      const res = await apiService.axiosInstance.get('/drive/list', { params })
      const raw = res.data?.data ?? res.data?.items ?? res.data
      return Array.isArray(raw) ? raw : []
    } catch (e: any) {
      const msg = e?.message
      const statusCode = e?.statusCode ?? e?.response?.status
      if ((statusCode === 400 || statusCode === 500) && msg) {
        throw new Error(msg)
      }
      console.error('Erreur listChildren Drive:', e)
      return []
    }
  }

  async getItem(itemId: string): Promise<DriveItem | null> {
    try {
      const res = await apiService.axiosInstance.get(`/drive/list/${itemId}`)
      return res.data?.data ?? res.data ?? null
    } catch (e) {
      console.error('Erreur getItem Drive:', e)
      return null
    }
  }

  getPreviewUrl(item: DriveItem): string | null {
    if (!item?.id) return null
    const base = `https://drive.google.com/file/d/${item.id}/preview`
    if (item.mimeType?.startsWith('image/')) {
      return `/api/proxy/google/drive/file/${item.id}`
    }
    if (item.mimeType === 'application/pdf' || item.webViewLink) {
      return base
    }
    return base
  }
}

export const googleDriveService = new GoogleDriveService()
export default googleDriveService


