export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export async function searchDriveVideos(accessToken: string, folderId?: string): Promise<DriveItem[]> {
  try {
    let q = "(mimeType contains 'video/' or name contains '.mp4' or name contains '.mkv' or name contains '.webm' or name contains '.avi') and trashed = false";
    if (folderId) {
      q = `'${folderId}' in parents and (${q})`;
    }

    const fields = 'files(id, name, mimeType, size, thumbnailLink, webContentLink, webViewLink, modifiedTime)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=50&orderBy=name`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Google Drive API error: ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to search Drive videos:', error);
    throw error;
  }
}

export async function listDriveFolders(accessToken: string): Promise<DriveItem[]> {
  try {
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const fields = 'files(id, name, mimeType, modifiedTime)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=30&orderBy=name`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Google Drive API error: ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list Drive folders:', error);
    throw error;
  }
}

export function formatFileSize(bytes?: string): string {
  if (!bytes) return '';
  const num = parseInt(bytes, 10);
  if (isNaN(num)) return '';
  if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
  if (num < 1024 * 1024 * 1024) return (num / (1024 * 1024)).toFixed(1) + ' MB';
  return (num / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
