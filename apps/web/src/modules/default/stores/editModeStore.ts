import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useEditModeStore = defineStore('editMode', () => {
  const STORAGE_KEY = 'vsg_edit_mode';

  const isEditMode = ref(false);

  function toggleEditMode(): void {
    isEditMode.value = !isEditMode.value;
  }

  function loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        isEditMode.value = saved === 'true';
      }
    } catch {
      // LocalStorage not available
    }
  }

  function clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // LocalStorage not available
    }
  }

  watch(isEditMode, (newValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(newValue));
    } catch {
      // LocalStorage not available
    }
  });

  loadFromStorage();

  return {
    isEditMode,
    toggleEditMode,
    clearStorage,
  };
});
