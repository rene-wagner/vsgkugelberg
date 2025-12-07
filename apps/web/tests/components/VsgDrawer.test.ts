import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgDrawer from '@/components/VsgDrawer.vue';
import { usePostsStore } from '@/stores/posts';
import { useDepartmentsStore } from '@/stores/departments';
import { useCategoriesStore } from '@/stores/categories';
import { useUsersAdminStore } from '@/stores/usersAdmin';

// Mock the apiClient
vi.mock('@/utils/apiClient', () => ({
  fetchPosts: vi.fn().mockResolvedValue({
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  }),
  createPost: vi.fn().mockResolvedValue({}),
  updatePost: vi.fn().mockResolvedValue({}),
  deletePost: vi.fn().mockResolvedValue(undefined),
  fetchDepartments: vi.fn().mockResolvedValue([]),
  createDepartment: vi.fn().mockResolvedValue({}),
  updateDepartment: vi.fn().mockResolvedValue({}),
  deleteDepartment: vi.fn().mockResolvedValue(undefined),
  fetchCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn().mockResolvedValue({}),
  updateCategory: vi.fn().mockResolvedValue({}),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
  fetchUsers: vi.fn().mockResolvedValue([]),
  createUser: vi.fn().mockResolvedValue({}),
  updateUser: vi.fn().mockResolvedValue({}),
  deleteUser: vi.fn().mockResolvedValue(undefined),
}));

// Stub the form components to simplify testing
const formStubs = {
  VsgPostForm: {
    template: '<div class="mock-post-form" data-testid="post-form"><slot /></div>',
    props: ['loading', 'error', 'initialData'],
    emits: ['save', 'cancel'],
  },
  VsgDepartmentForm: {
    template: '<div class="mock-department-form" data-testid="department-form"><slot /></div>',
    props: ['loading', 'error', 'initialData'],
    emits: ['save', 'cancel'],
  },
  VsgCategoryForm: {
    template: '<div class="mock-category-form" data-testid="category-form"><slot /></div>',
    props: ['loading', 'error', 'initialData'],
    emits: ['save', 'cancel'],
  },
  VsgUserForm: {
    template: '<div class="mock-user-form" data-testid="user-form"><slot /></div>',
    props: ['loading', 'error', 'initialData'],
    emits: ['save', 'cancel'],
  },
};

describe('VsgDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Create a teleport target
    const el = document.createElement('div');
    el.id = 'teleport-target';
    document.body.appendChild(el);
  });

  const mountDrawer = (props: { isOpen: boolean; username: string }) => {
    return mount(VsgDrawer, {
      props,
      global: {
        stubs: {
          Teleport: true,
          Transition: false,
          ...formStubs,
        },
      },
    });
  };

  describe('rendering', () => {
    it('does not render content when closed', () => {
      const wrapper = mountDrawer({ isOpen: false, username: 'testuser' });
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(false);
    });

    it('renders content when open', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true);
    });

    it('renders the overlay when open', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.find('.bg-black\\/50').exists()).toBe(true);
    });

    it('renders the drawer panel', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.find('.w-80').exists()).toBe(true);
    });

    it('displays the header with title', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.text()).toContain('Schnellzugriff');
    });

    it('displays the username', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'johndoe' });
      expect(wrapper.text()).toContain('johndoe');
      expect(wrapper.text()).toContain('Eingeloggt als');
    });

    it('renders close button with aria-label', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const closeButton = wrapper.find('button[aria-label="Drawer schliessen"]');
      expect(closeButton.exists()).toBe(true);
    });

    it('renders logout button', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.text()).toContain('Abmelden');
    });
  });

  describe('quick links', () => {
    it('renders all quick links', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.text()).toContain('Mein Profil');
      expect(wrapper.text()).toContain('Einstellungen');
      expect(wrapper.text()).toContain('Nachrichten');
      expect(wrapper.text()).toContain('Hilfe');
    });

    it('quick links have correct href attributes', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const links = wrapper.findAll('nav a');
      const hrefs = links.map((link) => link.attributes('href'));
      expect(hrefs).toContain('/profil');
      expect(hrefs).toContain('/einstellungen');
      expect(hrefs).toContain('/nachrichten');
      expect(hrefs).toContain('/hilfe');
    });
  });

  describe('action buttons', () => {
    it('renders Beiträge button', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));
      expect(beitraegeButton).toBeDefined();
    });

    it('renders Abteilungen button', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const abteilungenButton = buttons.find((b) => b.text().includes('Abteilungen'));
      expect(abteilungenButton).toBeDefined();
    });

    it('renders Kategorien button', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const kategorienButton = buttons.find((b) => b.text().includes('Kategorien'));
      expect(kategorienButton).toBeDefined();
    });

    it('renders Benutzer button', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const benutzerButton = buttons.find((b) => b.text().includes('Benutzer'));
      expect(benutzerButton).toBeDefined();
    });
  });

  describe('events', () => {
    it('emits close event when overlay is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const overlay = wrapper.find('.bg-black\\/50');

      await overlay.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('emits close event when close button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const closeButton = wrapper.find('button[aria-label="Drawer schliessen"]');

      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('emits logout event when logout button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const logoutButton = buttons.find((b) => b.text().includes('Abmelden'));

      await logoutButton!.trigger('click');

      expect(wrapper.emitted('logout')).toBeTruthy();
      expect(wrapper.emitted('logout')).toHaveLength(1);
    });
  });

  describe('posts panel', () => {
    it('posts panel is hidden by default', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      // The posts panel should not be visible initially
      expect(wrapper.find('h2').text()).not.toBe('Beiträge');
    });

    it('opens posts panel when Beiträge button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));

      await beitraegeButton!.trigger('click');
      await flushPromises();

      // Look for the posts panel header
      const headers = wrapper.findAll('h2');
      const postsPanelHeader = headers.find((h) => h.text() === 'Beiträge');
      expect(postsPanelHeader).toBeDefined();
    });

    it('fetches posts when panel opens', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const postsStore = usePostsStore();
      const fetchPostsSpy = vi.spyOn(postsStore, 'fetchPosts');

      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));

      await beitraegeButton!.trigger('click');
      await flushPromises();

      expect(fetchPostsSpy).toHaveBeenCalled();
    });

    it('shows "Neuer Beitrag" button in posts panel', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));

      await beitraegeButton!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Neuer Beitrag');
    });

    it('has panel close button with correct aria-label', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });

      // Open posts panel
      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));
      await beitraegeButton!.trigger('click');
      await flushPromises();

      // Verify posts panel is open
      const headers = wrapper.findAll('h2');
      const postsPanelHeader = headers.find((h) => h.text() === 'Beiträge');
      expect(postsPanelHeader).toBeDefined();

      // Find the panel close button
      const panelCloseButton = wrapper.find('button[aria-label="Panel schliessen"]');
      expect(panelCloseButton.exists()).toBe(true);
    });
  });

  describe('departments panel', () => {
    it('opens departments panel when Abteilungen button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const abteilungenButton = buttons.find((b) => b.text().includes('Abteilungen'));

      await abteilungenButton!.trigger('click');
      await flushPromises();

      const headers = wrapper.findAll('h2');
      const departmentsPanelHeader = headers.find((h) => h.text() === 'Abteilungen');
      expect(departmentsPanelHeader).toBeDefined();
    });

    it('fetches departments when panel opens', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const departmentsStore = useDepartmentsStore();
      const fetchDepartmentsSpy = vi.spyOn(departmentsStore, 'fetchDepartments');

      const buttons = wrapper.findAll('button');
      const abteilungenButton = buttons.find((b) => b.text().includes('Abteilungen'));

      await abteilungenButton!.trigger('click');
      await flushPromises();

      expect(fetchDepartmentsSpy).toHaveBeenCalled();
    });

    it('shows "Neue Abteilung" button in departments panel', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const abteilungenButton = buttons.find((b) => b.text().includes('Abteilungen'));

      await abteilungenButton!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Neue Abteilung');
    });
  });

  describe('categories panel', () => {
    it('opens categories panel when Kategorien button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const kategorienButton = buttons.find((b) => b.text().includes('Kategorien'));

      await kategorienButton!.trigger('click');
      await flushPromises();

      const headers = wrapper.findAll('h2');
      const categoriesPanelHeader = headers.find((h) => h.text() === 'Kategorien');
      expect(categoriesPanelHeader).toBeDefined();
    });

    it('fetches categories when panel opens', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const categoriesStore = useCategoriesStore();
      const fetchCategoriesSpy = vi.spyOn(categoriesStore, 'fetchCategories');

      const buttons = wrapper.findAll('button');
      const kategorienButton = buttons.find((b) => b.text().includes('Kategorien'));

      await kategorienButton!.trigger('click');
      await flushPromises();

      expect(fetchCategoriesSpy).toHaveBeenCalled();
    });

    it('shows "Neue Kategorie" button in categories panel', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const kategorienButton = buttons.find((b) => b.text().includes('Kategorien'));

      await kategorienButton!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Neue Kategorie');
    });
  });

  describe('users panel', () => {
    it('opens users panel when Benutzer button is clicked', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const benutzerButton = buttons.find((b) => b.text().includes('Benutzer'));

      await benutzerButton!.trigger('click');
      await flushPromises();

      const headers = wrapper.findAll('h2');
      const usersPanelHeader = headers.find((h) => h.text() === 'Benutzer');
      expect(usersPanelHeader).toBeDefined();
    });

    it('fetches users when panel opens', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const usersAdminStore = useUsersAdminStore();
      const fetchUsersSpy = vi.spyOn(usersAdminStore, 'fetchUsers');

      const buttons = wrapper.findAll('button');
      const benutzerButton = buttons.find((b) => b.text().includes('Benutzer'));

      await benutzerButton!.trigger('click');
      await flushPromises();

      expect(fetchUsersSpy).toHaveBeenCalled();
    });

    it('shows "Neuer Benutzer" button in users panel', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const benutzerButton = buttons.find((b) => b.text().includes('Benutzer'));

      await benutzerButton!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Neuer Benutzer');
    });
  });

  describe('drawer close behavior', () => {
    it('resets posts panel state when drawer closes', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const postsStore = usePostsStore();

      // Open posts panel
      const buttons = wrapper.findAll('button');
      const beitraegeButton = buttons.find((b) => b.text().includes('Beiträge'));
      await beitraegeButton!.trigger('click');
      await flushPromises();

      // Spy on store methods
      const selectPostSpy = vi.spyOn(postsStore, 'selectPost');
      const clearCreateErrorSpy = vi.spyOn(postsStore, 'clearCreateError');
      const clearUpdateErrorSpy = vi.spyOn(postsStore, 'clearUpdateError');
      const clearDeleteErrorSpy = vi.spyOn(postsStore, 'clearDeleteError');

      // Close drawer by changing prop
      await wrapper.setProps({ isOpen: false });
      await flushPromises();

      expect(selectPostSpy).toHaveBeenCalledWith(null);
      expect(clearCreateErrorSpy).toHaveBeenCalled();
      expect(clearUpdateErrorSpy).toHaveBeenCalled();
      expect(clearDeleteErrorSpy).toHaveBeenCalled();
    });

    it('resets departments panel state when drawer closes', async () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const departmentsStore = useDepartmentsStore();

      // Open departments panel
      const buttons = wrapper.findAll('button');
      const abteilungenButton = buttons.find((b) => b.text().includes('Abteilungen'));
      await abteilungenButton!.trigger('click');
      await flushPromises();

      // Spy on store methods
      const selectDepartmentSpy = vi.spyOn(departmentsStore, 'selectDepartment');
      const clearCreateErrorSpy = vi.spyOn(departmentsStore, 'clearCreateError');
      const clearUpdateErrorSpy = vi.spyOn(departmentsStore, 'clearUpdateError');
      const clearDeleteErrorSpy = vi.spyOn(departmentsStore, 'clearDeleteError');

      // Close drawer
      await wrapper.setProps({ isOpen: false });
      await flushPromises();

      expect(selectDepartmentSpy).toHaveBeenCalledWith(null);
      expect(clearCreateErrorSpy).toHaveBeenCalled();
      expect(clearUpdateErrorSpy).toHaveBeenCalled();
      expect(clearDeleteErrorSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('close button has proper aria-label', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const closeButton = wrapper.find('button[aria-label="Drawer schliessen"]');
      expect(closeButton.exists()).toBe(true);
    });

    it('all buttons have type="button"', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button');
      });
    });
  });

  describe('props', () => {
    it('accepts isOpen prop', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      expect(wrapper.props('isOpen')).toBe(true);
    });

    it('accepts username prop', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'johndoe' });
      expect(wrapper.props('username')).toBe('johndoe');
    });

    it('updates when isOpen prop changes', async () => {
      const wrapper = mountDrawer({ isOpen: false, username: 'testuser' });
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(false);

      await wrapper.setProps({ isOpen: true });
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true);
    });
  });

  describe('styling', () => {
    it('drawer panel has correct width class', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const drawerPanel = wrapper.find('.w-80');
      expect(drawerPanel.exists()).toBe(true);
    });

    it('overlay has correct background class', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const overlay = wrapper.find('.bg-black\\/50');
      expect(overlay.exists()).toBe(true);
    });

    it('drawer has fixed positioning', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const container = wrapper.find('.fixed.inset-0');
      expect(container.exists()).toBe(true);
    });

    it('logout button has red text color', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'testuser' });
      const buttons = wrapper.findAll('button');
      const logoutButton = buttons.find((b) => b.text().includes('Abmelden'));
      expect(logoutButton!.classes()).toContain('text-red-600');
    });
  });

  describe('edge cases', () => {
    it('handles empty username', () => {
      const wrapper = mountDrawer({ isOpen: true, username: '' });
      expect(wrapper.text()).toContain('Eingeloggt als');
    });

    it('handles special characters in username', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'user@example.com' });
      expect(wrapper.text()).toContain('user@example.com');
    });

    it('handles long username', () => {
      const longUsername = 'verylongusernamethatmightcauseissues';
      const wrapper = mountDrawer({ isOpen: true, username: longUsername });
      expect(wrapper.text()).toContain(longUsername);
    });

    it('handles German characters in username', () => {
      const wrapper = mountDrawer({ isOpen: true, username: 'müller' });
      expect(wrapper.text()).toContain('müller');
    });
  });
});
