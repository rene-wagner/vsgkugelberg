import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgHeader from '@/components/VsgHeader.vue';
import { useUserStore } from '@/stores/user';
import { useEditModeStore } from '@/stores/editMode';
import { usePageBuilderStore } from '@/stores/pageBuilder';

// Mock the apiClient functions
vi.mock('@/utils/apiClient', () => ({
  logout: vi.fn(),
  fetchBlocks: vi.fn().mockResolvedValue([]),
  saveBlocks: vi.fn().mockResolvedValue([]),
}));

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/test-page',
  }),
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to'],
  },
}));

const createMockUser = () => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('VsgHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountHeader = () => {
    return mount(VsgHeader, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
          VsgNavigationMenu: true,
          VsgDrawer: true,
        },
      },
    });
  };

  it('renders the header element', () => {
    const wrapper = mountHeader();
    expect(wrapper.find('header').exists()).toBe(true);
  });

  describe('edit mode button', () => {
    it('is hidden when user is not authenticated', () => {
      const wrapper = mountHeader();
      const editButton = wrapper.find('button[aria-label="Bearbeitungsmodus umschalten"]');
      expect(editButton.exists()).toBe(false);
    });

    it('is visible when user is authenticated', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const wrapper = mountHeader();
      const editButton = wrapper.find('button[aria-label="Bearbeitungsmodus umschalten"]');
      expect(editButton.exists()).toBe(true);
    });

    it('toggles edit mode when clicked', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const editModeStore = useEditModeStore();
      expect(editModeStore.isEditMode).toBe(false);

      const wrapper = mountHeader();
      const editButton = wrapper.find('button[aria-label="Bearbeitungsmodus umschalten"]');

      await editButton.trigger('click');
      expect(editModeStore.isEditMode).toBe(true);

      await editButton.trigger('click');
      expect(editModeStore.isEditMode).toBe(false);
    });

    it('has aria-pressed attribute reflecting edit mode state', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const wrapper = mountHeader();
      const editButton = wrapper.find('button[aria-label="Bearbeitungsmodus umschalten"]');

      expect(editButton.attributes('aria-pressed')).toBe('false');

      await editButton.trigger('click');
      expect(editButton.attributes('aria-pressed')).toBe('true');
    });

    it('has active styling when edit mode is on', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const wrapper = mountHeader();
      const editButton = wrapper.find('button[aria-label="Bearbeitungsmodus umschalten"]');

      expect(editButton.classes()).not.toContain('bg-[#003d8a]');

      await editButton.trigger('click');
      expect(editButton.classes()).toContain('bg-[#003d8a]');
    });
  });

  describe('save button', () => {
    it('is hidden when edit mode is off', () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const wrapper = mountHeader();
      const saveButton = wrapper.find('button[aria-label="Seite speichern"]');
      expect(saveButton.exists()).toBe(false);
    });

    it('is visible when edit mode is on', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const wrapper = mountHeader();
      const saveButton = wrapper.find('button[aria-label="Seite speichern"]');
      expect(saveButton.exists()).toBe(true);
    });

    it('calls saveBlocks when clicked', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const saveSpy = vi.spyOn(pageBuilderStore, 'saveBlocks').mockResolvedValue();

      const wrapper = mountHeader();
      const saveButton = wrapper.find('button[aria-label="Seite speichern"]');
      await saveButton.trigger('click');

      expect(saveSpy).toHaveBeenCalledWith('/test-page');
    });

    it('is disabled while saving', async () => {
      const userStore = useUserStore();
      userStore.setUser(createMockUser());

      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      // Simulate loading state
      pageBuilderStore.$patch({ isLoading: true });

      const wrapper = mountHeader();
      const saveButton = wrapper.find('button[aria-label="Seite speichern"]');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });
  });
});
