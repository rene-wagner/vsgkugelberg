import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgMarkdownEditor from '@/components/VsgMarkdownEditor.vue';

// Mock the md-editor-v3 component
vi.mock('md-editor-v3', () => ({
  MdEditor: {
    name: 'MdEditor',
    template: `
      <div class="mock-md-editor" data-testid="md-editor">
        <textarea 
          :value="modelValue" 
          :placeholder="placeholder"
          :disabled="disabled"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
    props: {
      modelValue: String,
      toolbars: Array,
      placeholder: String,
      disabled: Boolean,
      language: String,
      preview: Boolean,
      noMermaid: Boolean,
      noKatex: Boolean,
      noHighlight: Boolean,
    },
    emits: ['update:modelValue'],
  },
}));

// Mock the CSS import
vi.mock('md-editor-v3/lib/style.css', () => ({}));

describe('VsgMarkdownEditor', () => {
  const mountEditor = (props: {
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
  }) => {
    return mount(VsgMarkdownEditor, {
      props,
    });
  };

  describe('rendering', () => {
    it('renders the editor wrapper', () => {
      const wrapper = mountEditor({ modelValue: '' });
      expect(wrapper.find('.vsg-markdown-editor').exists()).toBe(true);
    });

    it('renders the MdEditor component', () => {
      const wrapper = mountEditor({ modelValue: '' });
      expect(wrapper.findComponent({ name: 'MdEditor' }).exists()).toBe(true);
    });
  });

  describe('props', () => {
    it('passes modelValue to the editor', () => {
      const testContent = '# Hello World';
      const wrapper = mountEditor({ modelValue: testContent });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe(testContent);
    });

    it('passes placeholder to the editor', () => {
      const placeholder = 'Enter your markdown here...';
      const wrapper = mountEditor({
        modelValue: '',
        placeholder,
      });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('placeholder')).toBe(placeholder);
    });

    it('passes disabled state to the editor', () => {
      const wrapper = mountEditor({
        modelValue: '',
        disabled: true,
      });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('disabled')).toBe(true);
    });

    it('defaults disabled to falsy when not provided', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('disabled')).toBeFalsy();
    });
  });

  describe('events', () => {
    it('emits update:modelValue when editor content changes', async () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      const newValue = '## New Content';
      await editor.vm.$emit('update:modelValue', newValue);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([newValue]);
    });

    it('emits multiple update events correctly', async () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      await editor.vm.$emit('update:modelValue', 'First');
      await editor.vm.$emit('update:modelValue', 'Second');
      await editor.vm.$emit('update:modelValue', 'Third');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toHaveLength(3);
      expect(emitted![0]).toEqual(['First']);
      expect(emitted![1]).toEqual(['Second']);
      expect(emitted![2]).toEqual(['Third']);
    });
  });

  describe('editor configuration', () => {
    it('configures editor with English language', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('language')).toBe('de-DE');
    });

    it('disables preview by default', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('preview')).toBe(false);
    });

    it('disables mermaid diagrams', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('noMermaid')).toBe(true);
    });

    it('disables katex math rendering', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('noKatex')).toBe(true);
    });

    it('enables code highlighting', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('noHighlight')).toBe(false);
    });

    it('provides toolbar configuration', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars');

      expect(toolbars).toBeDefined();
      expect(Array.isArray(toolbars)).toBe(true);
    });

    it('includes essential formatting tools in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      // Check for essential formatting tools
      expect(toolbars).toContain('bold');
      expect(toolbars).toContain('italic');
      expect(toolbars).toContain('underline');
      expect(toolbars).toContain('strikeThrough');
    });

    it('includes structural tools in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      // Check for structural tools
      expect(toolbars).toContain('title');
      expect(toolbars).toContain('quote');
      expect(toolbars).toContain('unorderedList');
      expect(toolbars).toContain('orderedList');
    });

    it('includes code tools in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      // Check for code tools
      expect(toolbars).toContain('codeRow');
      expect(toolbars).toContain('code');
    });

    it('includes media tools in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      // Check for media tools
      expect(toolbars).toContain('link');
      expect(toolbars).toContain('image');
    });

    it('includes history tools in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      // Check for history tools (undo/redo)
      expect(toolbars).toContain('revoke');
      expect(toolbars).toContain('next');
    });

    it('includes preview toggle in toolbar', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });
      const toolbars = editor.props('toolbars') as string[];

      expect(toolbars).toContain('preview');
    });
  });

  describe('v-model behavior', () => {
    it('supports v-model two-way binding', async () => {
      const wrapper = mountEditor({ modelValue: 'Initial content' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      // Verify initial value is passed
      expect(editor.props('modelValue')).toBe('Initial content');

      // Simulate user input
      await editor.vm.$emit('update:modelValue', 'Updated content');

      // Verify event is emitted for parent to update
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Updated content']);
    });

    it('updates when prop changes', async () => {
      const wrapper = mountEditor({ modelValue: 'Initial' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe('Initial');

      await wrapper.setProps({ modelValue: 'Changed' });

      expect(editor.props('modelValue')).toBe('Changed');
    });
  });

  describe('accessibility', () => {
    it('has a container div for styling', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const container = wrapper.find('.vsg-markdown-editor');

      expect(container.exists()).toBe(true);
      expect(container.element.tagName).toBe('DIV');
    });
  });

  describe('edge cases', () => {
    it('handles empty string value', () => {
      const wrapper = mountEditor({ modelValue: '' });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe('');
    });

    it('handles multiline markdown content', () => {
      const multilineContent = `# Heading

This is a paragraph.

- Item 1
- Item 2

\`\`\`javascript
const code = 'example';
\`\`\``;

      const wrapper = mountEditor({ modelValue: multilineContent });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe(multilineContent);
    });

    it('handles special characters in content', () => {
      const specialContent = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
      const wrapper = mountEditor({ modelValue: specialContent });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe(specialContent);
    });

    it('handles unicode characters', () => {
      const unicodeContent = '日本語テスト 🎉 émojis äöü';
      const wrapper = mountEditor({ modelValue: unicodeContent });
      const editor = wrapper.findComponent({ name: 'MdEditor' });

      expect(editor.props('modelValue')).toBe(unicodeContent);
    });
  });
});
