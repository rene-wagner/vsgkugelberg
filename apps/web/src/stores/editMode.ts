import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useEditModeStore = defineStore('editMode', () => {
  const isEditMode = ref(false);

  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value;
  };

  return {
    isEditMode,
    toggleEditMode,
  };
});
