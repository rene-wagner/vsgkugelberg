import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditModeStore } from '@/stores/editMode';

describe('editMode store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('has isEditMode set to false by default', () => {
    const store = useEditModeStore();
    expect(store.isEditMode).toBe(false);
  });

  it('toggles isEditMode from false to true', () => {
    const store = useEditModeStore();
    expect(store.isEditMode).toBe(false);

    store.toggleEditMode();

    expect(store.isEditMode).toBe(true);
  });

  it('toggles isEditMode from true to false', () => {
    const store = useEditModeStore();
    store.toggleEditMode(); // set to true
    expect(store.isEditMode).toBe(true);

    store.toggleEditMode(); // toggle back to false

    expect(store.isEditMode).toBe(false);
  });
});
