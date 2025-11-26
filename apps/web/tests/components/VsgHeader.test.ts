import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgHeader from '@/components/VsgHeader.vue';
import { useUserStore } from '@/stores/user';
import { useEditModeStore } from '@/stores/editMode';

// Mock the apiClient logout function
vi.mock('@/utils/apiClient', () => ({
  logout: vi.fn(),
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
});
