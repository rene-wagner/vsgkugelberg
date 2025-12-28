import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
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
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/media?page=${page}&limit=${limit}`,
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

  async function uploadMedia(file: File): Promise<MediaItem | null> {
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

      // Add to local state
      media.value.unshift(result);

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

  async function uploadMultipleMedia(files: File[]): Promise<MediaItem[]> {
    const results: MediaItem[] = [];

    for (const file of files) {
      const result = await uploadMedia(file);
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

  return {
    media,
    isLoading,
    error,
    uploadProgress,
    meta,
    getMediaUrl,
    fetchMedia,
    uploadMedia,
    uploadMultipleMedia,
    deleteMedia,
    clearError,
  };
});
