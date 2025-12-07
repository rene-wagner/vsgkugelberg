import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgBlockColumns from '@/components/blocks/VsgBlockColumns.vue';
import { useEditModeStore } from '@/stores/editMode';
import { usePageBuilderStore } from '@/stores/pageBuilder';

describe('VsgBlockColumns', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountColumns = (props?: Record<string, unknown>) => {
    return mount(VsgBlockColumns, {
      props,
      global: {
        stubs: {
          VsgBlockColumn: true,
          VsgBlockPicker: true,
        },
      },
    });
  };

  it('renders a div element', () => {
    const wrapper = mountColumns();
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('applies grid styling', () => {
    const wrapper = mountColumns();
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.exists()).toBe(true);
  });

  it('applies single column class for mobile by default', () => {
    const wrapper = mountColumns();
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('grid-cols-1');
  });

  it('defaults to 1 column on medium screens when columnCount is not provided', () => {
    const wrapper = mountColumns();
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('md:grid-cols-1');
  });

  it('applies correct column count class for medium screens when columnCount is 2', () => {
    const wrapper = mountColumns({ columnCount: 2 });
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('md:grid-cols-2');
  });

  it('applies correct column count class for medium screens when columnCount is 3', () => {
    const wrapper = mountColumns({ columnCount: 3 });
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('md:grid-cols-3');
  });

  it('applies correct column count class for medium screens when columnCount is 4', () => {
    const wrapper = mountColumns({ columnCount: 4 });
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('md:grid-cols-4');
  });

  it('falls back to 1 column for unsupported column counts', () => {
    const wrapper = mountColumns({ columnCount: 15 });
    const gridDiv = wrapper.find('.grid');
    expect(gridDiv.classes()).toContain('md:grid-cols-1');
  });

  describe('edit mode integration', () => {
    it('does not show add button when edit mode is off', () => {
      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);

      const wrapper = mountColumns({ blockId: columns.id });
      const addButton = wrapper.find('button[aria-label="Add column block"]');
      expect(addButton.exists()).toBe(false);
    });

    it('shows add button when edit mode is on and blockId is provided', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);

      const wrapper = mountColumns({ blockId: columns.id });
      const addButton = wrapper.find('button[aria-label="Add column block"]');
      expect(addButton.exists()).toBe(true);
    });
  });

  describe('child blocks rendering', () => {
    it('renders child column blocks from store', () => {
      const editModeStore = useEditModeStore();
      editModeStore.toggleEditMode();

      const pageBuilderStore = usePageBuilderStore();
      const section = pageBuilderStore.addBlock('section', null);
      const columns = pageBuilderStore.addBlock('columns', section.id);
      pageBuilderStore.addBlock('column', columns.id);
      pageBuilderStore.addBlock('column', columns.id);

      const wrapper = mountColumns({ blockId: columns.id });
      const columnStubs = wrapper.findAllComponents({ name: 'VsgBlockColumn' });
      expect(columnStubs).toHaveLength(2);
    });
  });
});
