import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgNavigationMenu, { type VsgMenuItem } from '@/components/VsgNavigationMenu.vue';

describe('VsgNavigationMenu', () => {
  const createRouterLinkStub = () => ({
    template: '<a :href="to" @click="$emit(\'click\')"><slot /></a>',
    props: ['to', 'activeClass'],
  });

  const mountMenu = (menuItems: VsgMenuItem[]) => {
    return mount(VsgNavigationMenu, {
      props: { menuItems },
      global: {
        stubs: {
          RouterLink: createRouterLinkStub(),
        },
      },
    });
  };

  const simpleMenuItems: VsgMenuItem[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const menuWithDropdown: VsgMenuItem[] = [
    { label: 'Home', path: '/' },
    {
      label: 'Services',
      children: [
        { label: 'Web Development', path: '/services/web' },
        { label: 'Mobile Apps', path: '/services/mobile' },
        { label: 'Consulting', path: '/services/consulting' },
      ],
    },
    { label: 'Contact', path: '/contact' },
  ];

  const menuWithMixedChildren: VsgMenuItem[] = [
    {
      label: 'Products',
      children: [
        { label: 'Product A', path: '/products/a' },
        { label: 'Coming Soon' }, // No path - disabled item
        { label: 'Product B', path: '/products/b' },
      ],
    },
  ];

  describe('rendering', () => {
    it('renders a nav element', () => {
      const wrapper = mountMenu(simpleMenuItems);
      expect(wrapper.find('nav').exists()).toBe(true);
    });

    it('renders desktop menu (hidden on mobile)', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const desktopMenu = wrapper.find('ul.hidden.md\\:flex');
      expect(desktopMenu.exists()).toBe(true);
    });

    it('renders mobile menu button', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');
      expect(mobileButton.exists()).toBe(true);
    });

    it('renders all menu items in desktop menu', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const desktopMenu = wrapper.find('ul.hidden.md\\:flex');
      const listItems = desktopMenu.findAll('li');
      expect(listItems).toHaveLength(simpleMenuItems.length);
    });
  });

  describe('simple menu items (no children)', () => {
    it('renders RouterLink for items with path', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const links = wrapper.findAll('a[href]');
      // Desktop links (3) + we check at least one exists
      expect(links.length).toBeGreaterThanOrEqual(3);
    });

    it('renders correct labels for menu items', () => {
      const wrapper = mountMenu(simpleMenuItems);
      expect(wrapper.text()).toContain('Home');
      expect(wrapper.text()).toContain('About');
      expect(wrapper.text()).toContain('Contact');
    });

    it('renders span for items without path', () => {
      const itemsWithNoPath: VsgMenuItem[] = [{ label: 'Disabled Item' }];
      const wrapper = mountMenu(itemsWithNoPath);
      const desktopMenu = wrapper.find('ul.hidden.md\\:flex');
      const span = desktopMenu.find('span.text-white.cursor-default');
      expect(span.exists()).toBe(true);
      expect(span.text()).toBe('Disabled Item');
    });
  });

  describe('dropdown menu items (with children)', () => {
    it('renders dropdown button for items with children', () => {
      const wrapper = mountMenu(menuWithDropdown);
      const dropdownButtons = wrapper.findAll('button[aria-haspopup="true"]');
      expect(dropdownButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders dropdown label correctly', () => {
      const wrapper = mountMenu(menuWithDropdown);
      const dropdownButton = wrapper.find('button[aria-haspopup="true"]');
      expect(dropdownButton.text()).toContain('Services');
    });

    it('renders chevron icon in dropdown button', () => {
      const wrapper = mountMenu(menuWithDropdown);
      const dropdownButton = wrapper.find('button[aria-haspopup="true"]');
      const svg = dropdownButton.find('svg');
      expect(svg.exists()).toBe(true);
    });

    it('renders dropdown container with children links', () => {
      const wrapper = mountMenu(menuWithDropdown);
      // Check that child labels exist in the document
      expect(wrapper.text()).toContain('Web Development');
      expect(wrapper.text()).toContain('Mobile Apps');
      expect(wrapper.text()).toContain('Consulting');
    });

    it('renders RouterLink for child items with path', () => {
      const wrapper = mountMenu(menuWithDropdown);
      const childLinks = wrapper.findAll('a[href="/services/web"]');
      expect(childLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders span for child items without path', () => {
      const wrapper = mountMenu(menuWithMixedChildren);
      expect(wrapper.text()).toContain('Coming Soon');
      const graySpans = wrapper.findAll('span.text-gray-400, span.text-gray-500');
      expect(graySpans.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('mobile menu toggle', () => {
    it('mobile menu overlay is hidden by default', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileOverlay = wrapper.find('.fixed.top-16');
      // v-show makes it exist but hidden
      expect(mobileOverlay.isVisible()).toBe(false);
    });

    it('shows hamburger icon when menu is closed', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');
      const hamburgerIcon = mobileButton.find('svg path[d="M4 6h16M4 12h16M4 18h16"]');
      expect(hamburgerIcon.exists()).toBe(true);
    });

    it('opens mobile menu when button is clicked', async () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');

      await mobileButton.trigger('click');

      const mobileOverlay = wrapper.find('.fixed.top-16');
      expect(mobileOverlay.isVisible()).toBe(true);
    });

    it('shows close icon when menu is open', async () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');

      await mobileButton.trigger('click');

      const closeIcon = mobileButton.find('svg path[d="M6 18L18 6M6 6l12 12"]');
      expect(closeIcon.exists()).toBe(true);
    });

    it('toggles mobile menu state correctly', async () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');

      // Initially closed - hamburger icon visible
      expect(wrapper.find('svg path[d="M4 6h16M4 12h16M4 18h16"]').exists()).toBe(true);

      // Open menu
      await mobileButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Close icon visible when open
      expect(wrapper.find('svg path[d="M6 18L18 6M6 6l12 12"]').exists()).toBe(true);

      // Toggle again
      await mobileButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Hamburger icon visible again
      expect(wrapper.find('svg path[d="M4 6h16M4 12h16M4 18h16"]').exists()).toBe(true);
    });

    it('renders menu items in mobile overlay when open', async () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');

      await mobileButton.trigger('click');

      const mobileOverlay = wrapper.find('.fixed.top-16');
      expect(mobileOverlay.text()).toContain('Home');
      expect(mobileOverlay.text()).toContain('About');
      expect(mobileOverlay.text()).toContain('Contact');
    });
  });

  describe('mobile dropdown toggle', () => {
    it('mobile dropdown children are hidden by default', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');

      await mobileButton.trigger('click');

      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownContent = mobileOverlay.find('.bg-\\[\\#00204a\\]');
      expect(dropdownContent.isVisible()).toBe(false);
    });

    it('opens mobile dropdown when parent button is clicked', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      // Open mobile menu first
      await mobileMenuButton.trigger('click');

      // Find and click the dropdown toggle in mobile menu
      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownToggle = mobileOverlay.find('button');

      await dropdownToggle.trigger('click');

      const dropdownContent = mobileOverlay.find('.bg-\\[\\#00204a\\]');
      expect(dropdownContent.isVisible()).toBe(true);
    });

    it('toggles mobile dropdown chevron rotation on click', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      // Open mobile menu
      await mobileMenuButton.trigger('click');
      await wrapper.vm.$nextTick();

      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownToggle = mobileOverlay.find('button');
      const chevron = dropdownToggle.find('svg');

      // Initially not rotated
      expect(chevron.classes()).not.toContain('rotate-180');

      // Open dropdown
      await dropdownToggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(chevron.classes()).toContain('rotate-180');

      // Close dropdown - click again
      await dropdownToggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(chevron.classes()).not.toContain('rotate-180');
    });

    it('rotates chevron icon when dropdown is open', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      await mobileMenuButton.trigger('click');

      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownToggle = mobileOverlay.find('button');
      const chevron = dropdownToggle.find('svg');

      // Initially not rotated
      expect(chevron.classes()).not.toContain('rotate-180');

      // Click to open
      await dropdownToggle.trigger('click');

      // Now rotated
      expect(chevron.classes()).toContain('rotate-180');
    });

    it('resets dropdown state when mobile menu is closed', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      // Open mobile menu
      await mobileMenuButton.trigger('click');

      // Open dropdown
      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownToggle = mobileOverlay.find('button');
      await dropdownToggle.trigger('click');

      // Close mobile menu
      await mobileMenuButton.trigger('click');

      // Reopen mobile menu
      await mobileMenuButton.trigger('click');

      // Dropdown should be closed
      expect(mobileOverlay.find('.bg-\\[\\#00204a\\]').isVisible()).toBe(false);
    });
  });

  describe('mobile menu link behavior', () => {
    it('mobile links have click handlers that trigger menu close', async () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      // Open mobile menu
      await mobileMenuButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Verify the mobile menu is open (close icon visible)
      expect(wrapper.find('svg path[d="M6 18L18 6M6 6l12 12"]').exists()).toBe(true);

      // Click a link in the mobile menu
      const mobileOverlay = wrapper.find('.fixed.top-16');
      const mobileLinks = mobileOverlay.findAll('a');
      const aboutLink = mobileLinks.find((link) => link.attributes('href') === '/about');

      expect(aboutLink).toBeDefined();

      // Trigger click on the link
      if (aboutLink) {
        await aboutLink.trigger('click');
        await wrapper.vm.$nextTick();
      }

      // After clicking a mobile link, the hamburger icon should be visible (menu closed)
      expect(wrapper.find('svg path[d="M4 6h16M4 12h16M4 18h16"]').exists()).toBe(true);
    });

    it('closes mobile menu when a dropdown child link is clicked', async () => {
      const wrapper = mountMenu(menuWithDropdown);
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');

      // Open mobile menu
      await mobileMenuButton.trigger('click');

      // Open dropdown
      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownToggle = mobileOverlay.find('button');
      await dropdownToggle.trigger('click');

      // Click a child link
      const childLink = mobileOverlay.find('a[href="/services/web"]');
      await childLink.trigger('click');

      // Menu should close
      expect(wrapper.find('.fixed.top-16').isVisible()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('mobile menu button has aria-label', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');
      expect(mobileButton.exists()).toBe(true);
      expect(mobileButton.attributes('aria-label')).toBe('Main menu');
    });

    it('dropdown buttons have aria-haspopup attribute', () => {
      const wrapper = mountMenu(menuWithDropdown);
      const dropdownButtons = wrapper.findAll('button[aria-haspopup="true"]');
      expect(dropdownButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('mobile menu button has type="button"', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileButton = wrapper.find('button[aria-label="Main menu"]');
      expect(mobileButton.attributes('type')).toBe('button');
    });
  });

  describe('styling classes', () => {
    it('desktop menu has correct responsive classes', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const desktopMenu = wrapper.find('ul');
      expect(desktopMenu.classes()).toContain('hidden');
      expect(desktopMenu.classes()).toContain('md:flex');
    });

    it('mobile button container has correct responsive classes', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileContainer = wrapper.find('.md\\:hidden');
      expect(mobileContainer.exists()).toBe(true);
    });

    it('mobile overlay has correct fixed positioning', () => {
      const wrapper = mountMenu(simpleMenuItems);
      const mobileOverlay = wrapper.find('.fixed.top-16');
      expect(mobileOverlay.exists()).toBe(true);
      expect(mobileOverlay.classes()).toContain('fixed');
      expect(mobileOverlay.classes()).toContain('left-0');
      expect(mobileOverlay.classes()).toContain('w-full');
    });
  });

  describe('edge cases', () => {
    it('handles empty menu items array', () => {
      const wrapper = mountMenu([]);
      expect(wrapper.find('nav').exists()).toBe(true);
      const desktopMenu = wrapper.find('ul.hidden.md\\:flex');
      expect(desktopMenu.findAll('li')).toHaveLength(0);
    });

    it('handles menu item with empty children array', () => {
      const itemsWithEmptyChildren: VsgMenuItem[] = [
        { label: 'Empty Parent', children: [] },
      ];
      const wrapper = mountMenu(itemsWithEmptyChildren);
      // Should not render as dropdown (empty children)
      expect(wrapper.find('button[aria-haspopup="true"]').exists()).toBe(false);
    });

    it('handles deeply nested label text', () => {
      const itemsWithLongLabels: VsgMenuItem[] = [
        { label: 'This is a very long menu item label', path: '/long' },
        {
          label: 'Parent with long name',
          children: [
            { label: 'Child with an extremely long label name', path: '/child' },
          ],
        },
      ];
      const wrapper = mountMenu(itemsWithLongLabels);
      expect(wrapper.text()).toContain('This is a very long menu item label');
      expect(wrapper.text()).toContain('Child with an extremely long label name');
    });

    it('handles special characters in labels', () => {
      const itemsWithSpecialChars: VsgMenuItem[] = [
        { label: 'Über uns', path: '/about' },
        { label: 'FAQ & Hilfe', path: '/faq' },
        { label: 'Kontakt <Test>', path: '/contact' },
      ];
      const wrapper = mountMenu(itemsWithSpecialChars);
      expect(wrapper.text()).toContain('Über uns');
      expect(wrapper.text()).toContain('FAQ & Hilfe');
    });

    it('handles multiple dropdowns', async () => {
      const multipleDropdowns: VsgMenuItem[] = [
        {
          label: 'Dropdown 1',
          children: [{ label: 'Child 1A', path: '/1a' }],
        },
        {
          label: 'Dropdown 2',
          children: [{ label: 'Child 2A', path: '/2a' }],
        },
      ];
      const wrapper = mountMenu(multipleDropdowns);

      // Open mobile menu
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');
      await mobileMenuButton.trigger('click');

      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownButtons = mobileOverlay.findAll('button');

      expect(dropdownButtons.length).toBe(2);
    });

    it('only one mobile dropdown can be open at a time (chevron rotation)', async () => {
      const multipleDropdowns: VsgMenuItem[] = [
        {
          label: 'Dropdown 1',
          children: [{ label: 'Child 1A', path: '/1a' }],
        },
        {
          label: 'Dropdown 2',
          children: [{ label: 'Child 2A', path: '/2a' }],
        },
      ];
      const wrapper = mountMenu(multipleDropdowns);

      // Open mobile menu
      const mobileMenuButton = wrapper.find('button[aria-label="Main menu"]');
      await mobileMenuButton.trigger('click');
      await wrapper.vm.$nextTick();

      const mobileOverlay = wrapper.find('.fixed.top-16');
      const dropdownButtons = mobileOverlay.findAll('button');
      const chevron1 = dropdownButtons[0].find('svg');
      const chevron2 = dropdownButtons[1].find('svg');

      // Initially neither is rotated
      expect(chevron1.classes()).not.toContain('rotate-180');
      expect(chevron2.classes()).not.toContain('rotate-180');

      // Open first dropdown
      await dropdownButtons[0].trigger('click');
      await wrapper.vm.$nextTick();
      expect(chevron1.classes()).toContain('rotate-180');
      expect(chevron2.classes()).not.toContain('rotate-180');

      // Open second dropdown (should close first)
      await dropdownButtons[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(chevron1.classes()).not.toContain('rotate-180');
      expect(chevron2.classes()).toContain('rotate-180');
    });
  });

  describe('VsgMenuItem type export', () => {
    it('accepts valid VsgMenuItem structure', () => {
      // Type checking test - if this compiles, the type is correct
      const validItem: VsgMenuItem = {
        label: 'Test',
        path: '/test',
        children: [{ label: 'Child', path: '/child' }],
      };
      const wrapper = mountMenu([validItem]);
      expect(wrapper.text()).toContain('Test');
    });

    it('accepts minimal VsgMenuItem (label only)', () => {
      const minimalItem: VsgMenuItem = { label: 'Minimal' };
      const wrapper = mountMenu([minimalItem]);
      expect(wrapper.text()).toContain('Minimal');
    });
  });
});
