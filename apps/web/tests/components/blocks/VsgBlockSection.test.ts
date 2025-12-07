import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgBlockSection from '@/components/blocks/VsgBlockSection.vue';
import { useEditModeStore } from '@/stores/editMode';
import { usePageBuilderStore } from '@/stores/pageBuilder';

describe('VsgBlockSection', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountSection = (props?: Record<string, unknown>) => {
    return mount(VsgBlockSection, {
      props,
      global: {
        stubs: {
          VsgBlockColumns: true,
          VsgBlockPicker: true,
        },
      },
    });
  };

  it('renders a section element', () => {
    const wrapper = mountSection();
    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('renders without hero styling when isHero is not provided', () => {
    const wrapper = mountSection();
    const section = wrapper.find('section');
    expect(section.classes()).not.toContain('w-screen');
    expect(section.classes()).not.toContain('h-screen');
  });

  it('renders without hero styling when isHero is false', () => {
    const wrapper = mountSection({ isHero: false });
    const section = wrapper.find('section');
    expect(section.classes()).not.toContain('w-screen');
    expect(section.classes()).not.toContain('h-screen');
  });

  it('applies viewport dimension classes when isHero is true', () => {
    const wrapper = mountSection({ isHero: true });
    const section = wrapper.find('section');
    expect(section.classes()).toContain('w-screen');
    expect(section.classes()).toContain('h-screen');
  });

  it('applies flexbox centering classes when isHero is true', () => {
    const wrapper = mountSection({ isHero: true });
    const section = wrapper.find('section');
    expect(section.classes()).toContain('flex');
    expect(section.classes()).toContain('items-center');
    expect(section.classes()).toContain('justify-center');
  });

  describe('edit mode integration', () => {
    it('does not show add button when edit mode is off', () => {
      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);

      const wrapper = mountSection({ blockId: section.id });
      const addButton = wrapper.find('button[aria-label="Add columns block"]');
      expect(addButton.exists()).toBe(false);
    });

    it('shows add button when edit mode is on and blockId is provided', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);

      const wrapper = mountSection({ blockId: section.id });
      const addButton = wrapper.find('button[aria-label="Add columns block"]');
      expect(addButton.exists()).toBe(true);
    });

    it('does not show add button when blockId is not provided even in edit mode', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const wrapper = mountSection();
      const addButton = wrapper.find('button[aria-label="Add columns block"]');
      expect(addButton.exists()).toBe(false);
    });
  });

  describe('child blocks rendering', () => {
    it('renders child columns blocks from store', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      pageBuilderStore.addBlock('columns', section.id);
      pageBuilderStore.addBlock('columns', section.id);

      const wrapper = mountSection({ blockId: section.id });
      const columnsStubs = wrapper.findAllComponents({ name: 'VsgBlockColumns' });
      expect(columnsStubs).toHaveLength(2);
    });
  });
});
