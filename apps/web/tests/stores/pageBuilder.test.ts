import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePageBuilderStore } from '../../src/stores/pageBuilder';

describe('pageBuilder store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have empty blocks array', () => {
      const store = usePageBuilderStore();
      expect(store.blocks).toEqual([]);
    });

    it('should have empty rootBlocks', () => {
      const store = usePageBuilderStore();
      expect(store.rootBlocks).toEqual([]);
    });
  });

  describe('getAllowedChildren', () => {
    it('should return section for root level', () => {
      const store = usePageBuilderStore();
      expect(store.getAllowedChildren(null)).toEqual(['section']);
    });

    it('should return columns for section', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      expect(store.getAllowedChildren(section.id)).toEqual(['columns']);
    });

    it('should return column for columns', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      expect(store.getAllowedChildren(columns.id)).toEqual(['column']);
    });

    it('should return content blocks for column', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);
      expect(store.getAllowedChildren(column.id)).toEqual(['headline', 'paragraph', 'image']);
    });

    it('should return empty array for leaf blocks', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);
      const headline = store.addBlock('headline', column.id);
      expect(store.getAllowedChildren(headline.id)).toEqual([]);
    });

    it('should return empty array for non-existent parent', () => {
      const store = usePageBuilderStore();
      expect(store.getAllowedChildren('non-existent-id')).toEqual([]);
    });
  });

  describe('addBlock', () => {
    it('should add section to root level', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      expect(section.type).toBe('section');
      expect(section.parentId).toBeNull();
      expect(section.id).toBeTruthy();
      expect(store.blocks).toHaveLength(1);
      expect(store.rootBlocks).toHaveLength(1);
    });

    it('should add columns to section', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);

      expect(columns.type).toBe('columns');
      expect(columns.parentId).toBe(section.id);
      expect(store.getChildBlocks(section.id)).toHaveLength(1);
    });

    it('should add column to columns', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      expect(column.type).toBe('column');
      expect(column.parentId).toBe(columns.id);
    });

    it('should add content blocks to column', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      const headline = store.addBlock('headline', column.id);
      const paragraph = store.addBlock('paragraph', column.id);
      const image = store.addBlock('image', column.id);

      expect(headline.type).toBe('headline');
      expect(paragraph.type).toBe('paragraph');
      expect(image.type).toBe('image');
      expect(store.getChildBlocks(column.id)).toHaveLength(3);
    });

    it('should throw error for invalid block type at root', () => {
      const store = usePageBuilderStore();
      expect(() => store.addBlock('columns', null)).toThrow();
      expect(() => store.addBlock('headline', null)).toThrow();
    });

    it('should throw error for invalid child type', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      expect(() => store.addBlock('headline', section.id)).toThrow();
    });

    it('should use default props when no custom props provided', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      expect(section.props.isHero).toBe(false);

      const columns = store.addBlock('columns', section.id);
      expect(columns.props.columnCount).toBe(1);

      const column = store.addBlock('column', columns.id);
      const headline = store.addBlock('headline', column.id);
      expect(headline.props.level).toBe(2);
      expect(headline.props.content).toBe('New Headline');
    });

    it('should merge custom props with defaults', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null, { isHero: true });
      expect(section.props.isHero).toBe(true);

      const columns = store.addBlock('columns', section.id, { columnCount: 3 });
      expect(columns.props.columnCount).toBe(3);
    });

    it('should assign incrementing order values', () => {
      const store = usePageBuilderStore();
      const section1 = store.addBlock('section', null);
      const section2 = store.addBlock('section', null);
      const section3 = store.addBlock('section', null);

      expect(section1.order).toBe(0);
      expect(section2.order).toBe(1);
      expect(section3.order).toBe(2);
    });
  });

  describe('getChildBlocks', () => {
    it('should return children sorted by order', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns1 = store.addBlock('columns', section.id);
      const columns2 = store.addBlock('columns', section.id);
      const columns3 = store.addBlock('columns', section.id);

      const children = store.getChildBlocks(section.id);
      expect(children).toHaveLength(3);
      expect(children[0].id).toBe(columns1.id);
      expect(children[1].id).toBe(columns2.id);
      expect(children[2].id).toBe(columns3.id);
    });

    it('should return empty array for block with no children', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);

      expect(store.getChildBlocks(column.id)).toEqual([]);
    });
  });

  describe('getBlockById', () => {
    it('should return block by id', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      const foundBlock = store.getBlockById(section.id);
      expect(foundBlock).toBeDefined();
      expect(foundBlock?.id).toBe(section.id);
      expect(foundBlock?.type).toBe(section.type);
    });

    it('should return undefined for non-existent id', () => {
      const store = usePageBuilderStore();
      expect(store.getBlockById('non-existent')).toBeUndefined();
    });
  });

  describe('exportPageStructure', () => {
    it('should return all blocks', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      store.addBlock('column', columns.id);

      const structure = store.exportPageStructure();
      expect(structure).toHaveLength(3);
    });

    it('should log structure to console', () => {
      const store = usePageBuilderStore();
      const consoleSpy = vi.spyOn(console, 'log');

      store.addBlock('section', null);
      store.exportPageStructure();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeBlock', () => {
    it('should remove a leaf block', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);
      const headline = store.addBlock('headline', column.id);

      expect(store.blocks).toHaveLength(4);

      store.removeBlock(headline.id);

      expect(store.blocks).toHaveLength(3);
      expect(store.getBlockById(headline.id)).toBeUndefined();
      expect(store.getChildBlocks(column.id)).toHaveLength(0);
    });

    it('should remove a container block and all its descendants', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column = store.addBlock('column', columns.id);
      store.addBlock('headline', column.id);
      store.addBlock('paragraph', column.id);

      expect(store.blocks).toHaveLength(5);

      store.removeBlock(columns.id);

      expect(store.blocks).toHaveLength(1);
      expect(store.getBlockById(columns.id)).toBeUndefined();
      expect(store.getBlockById(column.id)).toBeUndefined();
      expect(store.getChildBlocks(section.id)).toHaveLength(0);
    });

    it('should remove a section and all nested descendants', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns = store.addBlock('columns', section.id);
      const column1 = store.addBlock('column', columns.id);
      const column2 = store.addBlock('column', columns.id);
      store.addBlock('headline', column1.id);
      store.addBlock('paragraph', column2.id);

      expect(store.blocks).toHaveLength(6);

      store.removeBlock(section.id);

      expect(store.blocks).toHaveLength(0);
      expect(store.rootBlocks).toHaveLength(0);
    });

    it('should do nothing when removing non-existent block', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);

      expect(store.blocks).toHaveLength(1);

      store.removeBlock('non-existent-id');

      expect(store.blocks).toHaveLength(1);
      expect(store.getBlockById(section.id)).toBeDefined();
    });

    it('should not affect sibling blocks when removing a block', () => {
      const store = usePageBuilderStore();
      const section = store.addBlock('section', null);
      const columns1 = store.addBlock('columns', section.id);
      const columns2 = store.addBlock('columns', section.id);
      const column1 = store.addBlock('column', columns1.id);
      store.addBlock('headline', column1.id);

      expect(store.blocks).toHaveLength(5);

      store.removeBlock(columns1.id);

      expect(store.blocks).toHaveLength(2);
      expect(store.getBlockById(columns2.id)).toBeDefined();
      expect(store.getChildBlocks(section.id)).toHaveLength(1);
    });
  });

  describe('clearBlocks', () => {
    it('should remove all blocks', () => {
      const store = usePageBuilderStore();
      store.addBlock('section', null);
      store.addBlock('section', null);

      expect(store.blocks).toHaveLength(2);

      store.clearBlocks();
      expect(store.blocks).toHaveLength(0);
      expect(store.rootBlocks).toHaveLength(0);
    });
  });
});
