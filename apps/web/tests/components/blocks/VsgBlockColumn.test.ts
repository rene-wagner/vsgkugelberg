import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgBlockColumn from '@/components/blocks/VsgBlockColumn.vue';
import { useEditModeStore } from '@/stores/editMode';
import { usePageBuilderStore } from '@/stores/pageBuilder';

describe('VsgBlockColumn', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountColumn = (props?: Record<string, unknown>) => {
    return mount(VsgBlockColumn, {
      props,
      global: {
        stubs: {
          VsgBlockHeadline: true,
          VsgBlockParagraph: true,
          VsgBlockImage: true,
          VsgBlockPicker: true,
        },
      },
    });
  };

  it('renders a div element', () => {
    const wrapper = mountColumn();
    expect(wrapper.find('div').exists()).toBe(true);
  });

  describe('edit mode integration', () => {
    it('does not show add button when edit mode is off', () => {
      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);

      const wrapper = mountColumn({ blockId: column.id });
      const addButton = wrapper.find('button[aria-label="Add content block"]');
      expect(addButton.exists()).toBe(false);
    });

    it('shows add button when edit mode is on and blockId is provided', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);

      const wrapper = mountColumn({ blockId: column.id });
      const addButton = wrapper.find('button[aria-label="Add content block"]');
      expect(addButton.exists()).toBe(true);
    });

    it('does not show add button when blockId is not provided', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const wrapper = mountColumn();
      const addButton = wrapper.find('button[aria-label="Add content block"]');
      expect(addButton.exists()).toBe(false);
    });
  });

  describe('child blocks rendering', () => {
    it('renders child headline blocks from store', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);
      pageBuilderStore.addBlock('headline', column.id);

      const wrapper = mountColumn({ blockId: column.id });
      const headlineStubs = wrapper.findAllComponents({ name: 'VsgBlockHeadline' });
      expect(headlineStubs).toHaveLength(1);
    });

    it('renders child paragraph blocks from store', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);
      pageBuilderStore.addBlock('paragraph', column.id);

      const wrapper = mountColumn({ blockId: column.id });
      const paragraphStubs = wrapper.findAllComponents({ name: 'VsgBlockParagraph' });
      expect(paragraphStubs).toHaveLength(1);
    });

    it('renders child image blocks from store', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);
      pageBuilderStore.addBlock('image', column.id);

      const wrapper = mountColumn({ blockId: column.id });
      const imageStubs = wrapper.findAllComponents({ name: 'VsgBlockImage' });
      expect(imageStubs).toHaveLength(1);
    });

    it('renders multiple different child block types', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      const column = pageBuilderStore.addBlock('column', columns.id);
      pageBuilderStore.addBlock('headline', column.id);
      pageBuilderStore.addBlock('paragraph', column.id);
      pageBuilderStore.addBlock('image', column.id);

      const wrapper = mountColumn({ blockId: column.id });
      expect(wrapper.findAllComponents({ name: 'VsgBlockHeadline' })).toHaveLength(1);
      expect(wrapper.findAllComponents({ name: 'VsgBlockParagraph' })).toHaveLength(1);
      expect(wrapper.findAllComponents({ name: 'VsgBlockImage' })).toHaveLength(1);
    });
  });
});
