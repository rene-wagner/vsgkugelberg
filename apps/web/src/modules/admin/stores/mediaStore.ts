import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ThumbnailsMap {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  thumbnails?: ThumbnailsMap | null;
  folderId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: number;
  name: string;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegenerateThumbnailsResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

interface PaginatedResponse {
  data: MediaItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export const useMediaStore = defineStore('media', () => {
  const media = ref<MediaItem[]>([]);
  const folders = ref<MediaFolder[]>([]);
  const currentFolderId = ref<number | null>(null);
  const currentFolder = ref<MediaFolder | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const uploadProgress = reactive<Map<string, UploadProgress>>(new Map());
  const meta = ref<PaginatedResponse['meta'] | null>(null);

  function getMediaUrl(item: MediaItem): string {
    return `${API_BASE_URL}/uploads/${item.filename}`;
  }

  async function fetchMedia(
    page: number = 1,
    limit: number = 24,
    folderId: number | null = currentFolderId.value,
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;
    currentFolderId.value = folderId;

    try {
      const folderParam = folderId === null ? 'null' : folderId;
      const response = await fetch(
        `${API_BASE_URL}/api/media?page=${page}&limit=${limit}&folderId=${folderParam}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const result = (await response.json()) as PaginatedResponse;
      media.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchFolderDetails(id: number): Promise<MediaFolder | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/folders/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folder details');
      }

      const result = (await response.json()) as MediaFolder;
      currentFolder.value = result;
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchFolders(
    parentId: number | null = currentFolderId.value,
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const parentParam = parentId === null ? 'null' : parentId;
      const response = await fetch(
        `${API_BASE_URL}/api/media/folders?parentId=${parentParam}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      folders.value = (await response.json()) as MediaFolder[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function createFolder(
    name: string,
    parentId: number | null = currentFolderId.value,
  ): Promise<MediaFolder | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const result = (await response.json()) as MediaFolder;
      folders.value.push(result);
      folders.value.sort((a, b) => a.name.localeCompare(b.name));
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteFolder(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/folders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      folders.value = folders.value.filter((f) => f.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function moveMedia(
    mediaId: number,
    folderId: number | null,
  ): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/media/${mediaId}/move`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderId }),
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to move media');
      }

      // If we are currently in a folder, and the item was moved out, remove it from list
      // Or if we move it INTO the current folder, we'd need to fetch it.
      // For simplicity, we just refetch current view if it was affected
      if (currentFolderId.value !== folderId) {
        media.value = media.value.filter((m) => m.id !== mediaId);
      }

      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadMedia(
    file: File,
    folderId: number | null = currentFolderId.value,
  ): Promise<MediaItem | null> {
    const uploadId = `${file.name}-${Date.now()}`;

    uploadProgress.set(uploadId, {
      filename: file.name,
      progress: 0,
      status: 'pending',
    });

    try {
      uploadProgress.set(uploadId, {
        filename: file.name,
        progress: 0,
        status: 'uploading',
      });

      const formData = new FormData();
      formData.append('file', file);
      if (folderId !== null) {
        formData.append('folderId', folderId.toString());
      }

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<MediaItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            uploadProgress.set(uploadId, {
              filename: file.name,
              progress,
              status: 'uploading',
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as MediaItem;
              resolve(response);
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${API_BASE_URL}/api/media`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      uploadProgress.set(uploadId, {
        filename: file.name,
        progress: 100,
        status: 'complete',
      });

      // Add to local state if we're in the same folder or if it was uploaded to root and we are at root
      if (currentFolderId.value === folderId) {
        media.value.unshift(result);
      }

      // Clean up progress after a delay
      setTimeout(() => {
        uploadProgress.delete(uploadId);
      }, 3000);

      return result;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Upload failed';
      uploadProgress.set(uploadId, {
        filename: file.name,
        progress: 0,
        status: 'error',
        error: errorMessage,
      });

      // Clean up after error display
      setTimeout(() => {
        uploadProgress.delete(uploadId);
      }, 5000);

      return null;
    }
  }

  async function uploadMultipleMedia(
    files: File[],
    folderId: number | null = currentFolderId.value,
  ): Promise<MediaItem[]> {
    const results: MediaItem[] = [];

    for (const file of files) {
      const result = await uploadMedia(file, folderId);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async function deleteMedia(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      media.value = media.value.filter((m) => m.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  const isRegenerating = ref(false);
  const regenerateProgress = ref<{
    current: number;
    total: number;
  } | null>(null);

  async function regenerateThumbnails(id: number): Promise<MediaItem | null> {
    isRegenerating.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/media/${id}/regenerate-thumbnails`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Thumbnails konnten nicht regeneriert werden',
        );
      }

      const updatedMedia = (await response.json()) as MediaItem;

      // Update local state
      const index = media.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        media.value[index] = updatedMedia;
      }

      return updatedMedia;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isRegenerating.value = false;
    }
  }

  async function regenerateAllThumbnails(): Promise<RegenerateThumbnailsResult | null> {
    isRegenerating.value = true;
    error.value = null;
    regenerateProgress.value = { current: 0, total: media.value.length };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/media/regenerate-thumbnails`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Thumbnails konnten nicht regeneriert werden',
        );
      }

      const result = (await response.json()) as RegenerateThumbnailsResult;

      // Refresh media list to get updated thumbnails
      await fetchMedia();

      return result;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isRegenerating.value = false;
      regenerateProgress.value = null;
    }
  }

  function hasThumbnails(item: MediaItem): boolean {
    return !!(
      item.thumbnails &&
      (item.thumbnails.thumb ||
        item.thumbnails.small ||
        item.thumbnails.medium ||
        item.thumbnails.large)
    );
  }

  function canHaveThumbnails(item: MediaItem): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(item.mimetype);
  }

  function getThumbnailUrl(
    item: MediaItem,
    size: keyof ThumbnailsMap = 'small',
  ): string | null {
    if (!item.thumbnails || !item.thumbnails[size]) {
      return null;
    }
    return `${API_BASE_URL}/uploads/${item.thumbnails[size]}`;
  }

  return {
    media,
    folders,
    currentFolderId,
    currentFolder,
    isLoading,
    error,
    uploadProgress,
    meta,
    isRegenerating,
    regenerateProgress,
    getMediaUrl,
    fetchMedia,
    fetchFolderDetails,
    fetchFolders,
    createFolder,
    deleteFolder,
    moveMedia,
    uploadMedia,
    uploadMultipleMedia,
    deleteMedia,
    clearError,
    regenerateThumbnails,
    regenerateAllThumbnails,
    hasThumbnails,
    canHaveThumbnails,
    getThumbnailUrl,
  };
});
