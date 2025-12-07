import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export type BlockType = 'section' | 'columns' | 'column' | 'headline' | 'paragraph' | 'image';

export interface BlockNode {
  id: string;
  type: BlockType;
  parentId: string | null;
  order: number;
  props: Record<string, unknown>;
}

export interface BlockConfig {
  type: BlockType;
  props?: Record<string, unknown>;
}

const ALLOWED_CHILDREN: Record<BlockType | 'root', BlockType[]> = {
  root: ['section'],
  section: ['columns'],
  columns: ['column'],
  column: ['headline', 'paragraph', 'image'],
  headline: [],
  paragraph: [],
  image: [],
};

const DEFAULT_PROPS: Record<BlockType, Record<string, unknown>> = {
  section: { isHero: false },
  columns: { columnCount: 1 },
  column: {},
  headline: { level: 2, content: 'New Headline' },
  paragraph: { content: 'New paragraph text' },
  image: { src: '', alt: 'Placeholder image' },
};

function generateUUID(): string {
  return crypto.randomUUID();
}

export const usePageBuilderStore = defineStore('pageBuilder', () => {
  const blocks = ref<BlockNode[]>([]);

  const rootBlocks = computed(() => {
    return blocks.value
      .filter((block) => block.parentId === null)
      .sort((a, b) => a.order - b.order);
  });

  function getChildBlocks(parentId: string): BlockNode[] {
    return blocks.value
      .filter((block) => block.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  function getBlockById(id: string): BlockNode | undefined {
    return blocks.value.find((block) => block.id === id);
  }

  function getAllowedChildren(parentId: string | null): BlockType[] {
    if (parentId === null) {
      return ALLOWED_CHILDREN.root;
    }
    const parent = getBlockById(parentId);
    if (!parent) {
      return [];
    }
    return ALLOWED_CHILDREN[parent.type];
  }

  function addBlock(
    type: BlockType,
    parentId: string | null,
    customProps?: Record<string, unknown>
  ): BlockNode {
    const allowedTypes = getAllowedChildren(parentId);
    if (!allowedTypes.includes(type)) {
      throw new Error(
        `Block type "${type}" is not allowed as a child of ${parentId === null ? 'root' : `block "${parentId}"`}`
      );
    }

    const siblings = parentId === null ? rootBlocks.value : getChildBlocks(parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((b) => b.order)) : -1;

    const newBlock: BlockNode = {
      id: generateUUID(),
      type,
      parentId,
      order: maxOrder + 1,
      props: { ...DEFAULT_PROPS[type], ...customProps },
    };

    blocks.value.push(newBlock);
    return newBlock;
  }

  function exportPageStructure(): BlockNode[] {
    const structure = [...blocks.value];
    // eslint-disable-next-line no-console
    console.log('Page Structure:', JSON.stringify(structure, null, 2));
    return structure;
  }

  function removeBlock(id: string): void {
    const block = getBlockById(id);
    if (!block) {
      return;
    }

    // Recursively collect all descendant IDs
    const idsToRemove = new Set<string>([id]);
    const collectDescendants = (parentId: string) => {
      const children = getChildBlocks(parentId);
      for (const child of children) {
        idsToRemove.add(child.id);
        collectDescendants(child.id);
      }
    };
    collectDescendants(id);

    // Remove all collected blocks
    blocks.value = blocks.value.filter((b) => !idsToRemove.has(b.id));
  }

  function clearBlocks(): void {
    blocks.value = [];
  }

  return {
    blocks,
    rootBlocks,
    getChildBlocks,
    getBlockById,
    getAllowedChildren,
    addBlock,
    removeBlock,
    exportPageStructure,
    clearBlocks,
  };
});
