import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VsgBlockPicker from '@/components/VsgBlockPicker.vue';
import { usePageBuilderStore } from '@/stores/pageBuilder';

describe('VsgBlockPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountBlockPicker = (props: { parentId: string | null }) => {
    return mount(VsgBlockPicker, {
      props,
    });
  };

  describe('root level picker', () => {
    it('displays only section option at root level', () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      expect(sectionButton).toBeDefined();
      expect(buttons.filter((b) => b.text().includes('Columns'))).toHaveLength(0);
      expect(buttons.filter((b) => b.text().includes('Headline'))).toHaveLength(0);
    });

    it('shows section type selector when section is clicked', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      await sectionButton!.trigger('click');

      expect(wrapper.text()).toContain('Section Type');
      expect(wrapper.text()).toContain('Normal');
      expect(wrapper.text()).toContain('Hero');
    });

    it('emits select event with isHero false when Normal is clicked', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      await sectionButton!.trigger('click');

      const normalButton = wrapper.findAll('button').find((b) => b.text().includes('Normal'));
      await normalButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'section', props: { isHero: false } }]);
    });

    it('emits select event with isHero true when Hero is clicked', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      await sectionButton!.trigger('click');

      const heroButton = wrapper.findAll('button').find((b) => b.text().includes('Hero'));
      await heroButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'section', props: { isHero: true } }]);
    });

    it('has back button in section type selector', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      await sectionButton!.trigger('click');

      const backButton = wrapper.find('button[aria-label="Back"]');
      expect(backButton.exists()).toBe(true);
    });

    it('returns to main view when back button is clicked from section selector', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const sectionButton = buttons.find((b) => b.text().includes('Section'));

      await sectionButton!.trigger('click');
      expect(wrapper.text()).toContain('Section Type');

      const backButton = wrapper.find('button[aria-label="Back"]');
      await backButton.trigger('click');

      expect(wrapper.text()).toContain('Add Block');
      expect(wrapper.text()).not.toContain('Section Type');
    });
  });

  describe('section level picker', () => {
    it('displays only columns option for section parent', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const wrapper = mountBlockPicker({ parentId: section.id });
      const buttons = wrapper.findAll('button');
      const columnsButton = buttons.find((b) => b.text().includes('Columns'));

      expect(columnsButton).toBeDefined();
      expect(buttons.filter((b) => b.text().includes('Section'))).toHaveLength(0);
      expect(buttons.filter((b) => b.text().includes('Headline'))).toHaveLength(0);
    });

    it('shows column count selector when columns is clicked', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const wrapper = mountBlockPicker({ parentId: section.id });
      const buttons = wrapper.findAll('button');
      const columnsButton = buttons.find((b) => b.text().includes('Columns'));

      await columnsButton!.trigger('click');

      expect(wrapper.text()).toContain('Column Count');
      expect(wrapper.findAll('button').filter((b) => b.text().match(/^[1-4]$/))).toHaveLength(4);
    });

    it('emits select with column count when count is selected', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const wrapper = mountBlockPicker({ parentId: section.id });
      const buttons = wrapper.findAll('button');
      const columnsButton = buttons.find((b) => b.text().includes('Columns'));

      await columnsButton!.trigger('click');

      // Find the button for 3 columns
      const countButtons = wrapper.findAll('button');
      const threeColumnsButton = countButtons.find((b) => b.text().trim() === '3');
      await threeColumnsButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([
        { type: 'columns', props: { columnCount: 3 } },
      ]);
    });

    it('has back button in column count selector', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const wrapper = mountBlockPicker({ parentId: section.id });
      const buttons = wrapper.findAll('button');
      const columnsButton = buttons.find((b) => b.text().includes('Columns'));

      await columnsButton!.trigger('click');

      const backButton = wrapper.find('button[aria-label="Back"]');
      expect(backButton.exists()).toBe(true);
    });

    it('returns to main view when back button is clicked', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const wrapper = mountBlockPicker({ parentId: section.id });
      const buttons = wrapper.findAll('button');
      const columnsButton = buttons.find((b) => b.text().includes('Columns'));

      await columnsButton!.trigger('click');
      expect(wrapper.text()).toContain('Column Count');

      const backButton = wrapper.find('button[aria-label="Back"]');
      await backButton.trigger('click');

      expect(wrapper.text()).toContain('Add Block');
      expect(wrapper.text()).not.toContain('Column Count');
    });
  });

  describe('columns level picker', () => {
    it('displays only column option for columns parent', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);

      const wrapper = mountBlockPicker({ parentId: columns.id });
      const buttons = wrapper.findAll('button');
      const columnButton = buttons.find((b) => b.text().includes('Column'));

      expect(columnButton).toBeDefined();
      expect(buttons.filter((b) => b.text().includes('Section'))).toHaveLength(0);
      expect(buttons.filter((b) => b.text().includes('Columns'))).toHaveLength(0);
    });

    it('emits select event with column type', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);

      const wrapper = mountBlockPicker({ parentId: columns.id });
      const buttons = wrapper.findAll('button');
      const columnButton = buttons.find((b) => b.text().includes('Column'));

      await columnButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'column' }]);
    });
  });

  describe('column level picker', () => {
    it('displays content block options for column parent', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      const wrapper = mountBlockPicker({ parentId: column.id });
      const text = wrapper.text();

      expect(text).toContain('Headline');
      expect(text).toContain('Paragraph');
      expect(text).toContain('Image');
    });

    it('emits select event with headline type', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      const wrapper = mountBlockPicker({ parentId: column.id });
      const buttons = wrapper.findAll('button');
      const headlineButton = buttons.find((b) => b.text().includes('Headline'));

      await headlineButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'headline' }]);
    });

    it('emits select event with paragraph type', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      const wrapper = mountBlockPicker({ parentId: column.id });
      const buttons = wrapper.findAll('button');
      const paragraphButton = buttons.find((b) => b.text().includes('Paragraph'));

      await paragraphButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'paragraph' }]);
    });

    it('emits select event with image type', async () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      const wrapper = mountBlockPicker({ parentId: column.id });
      const buttons = wrapper.findAll('button');
      const imageButton = buttons.find((b) => b.text().includes('Image'));

      await imageButton!.trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([{ type: 'image' }]);
    });
  });

  describe('close functionality', () => {
    it('has cancel button', () => {
      const wrapper = mountBlockPicker({ parentId: null });
      expect(wrapper.text()).toContain('Cancel');
    });

    it('emits close event when cancel is clicked', async () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const buttons = wrapper.findAll('button');
      const cancelButton = buttons.find((b) => b.text().includes('Cancel'));

      await cancelButton!.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('has proper container styling', () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const container = wrapper.find('.absolute.z-50');
      expect(container.exists()).toBe(true);
    });

    it('renders block type icons', () => {
      const wrapper = mountBlockPicker({ parentId: null });
      const svgs = wrapper.findAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
