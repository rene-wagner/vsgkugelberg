import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockParagraph from '@/components/blocks/VsgBlockParagraph.vue';

describe('VsgBlockParagraph', () => {
  it('renders a paragraph element', () => {
    const wrapper = mount(VsgBlockParagraph);
    expect(wrapper.find('p').exists()).toBe(true);
  });

  it('renders the content prop inside the paragraph', () => {
    const content = 'This is a test paragraph.';
    const wrapper = mount(VsgBlockParagraph, {
      props: { content },
    });
    expect(wrapper.find('p').text()).toBe(content);
  });

  it('renders an empty paragraph when no content is provided', () => {
    const wrapper = mount(VsgBlockParagraph);
    expect(wrapper.find('p').text()).toBe('');
  });

  it('renders an empty paragraph when content is empty string', () => {
    const wrapper = mount(VsgBlockParagraph, {
      props: { content: '' },
    });
    expect(wrapper.find('p').text()).toBe('');
  });

  it('applies text styling classes', () => {
    const wrapper = mount(VsgBlockParagraph);
    const paragraph = wrapper.find('p');
    expect(paragraph.classes()).toContain('text-gray-700');
    expect(paragraph.classes()).toContain('leading-relaxed');
  });
});
