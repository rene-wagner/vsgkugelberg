import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockHeadline from '@/components/blocks/VsgBlockHeadline.vue';

describe('VsgBlockHeadline', () => {
  it('renders an h1 element by default when no level is provided', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { content: 'Test Headline' },
    });
    expect(wrapper.find('h1').exists()).toBe(true);
  });

  it('renders an h1 element when level is 1', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 1, content: 'Test Headline' },
    });
    expect(wrapper.find('h1').exists()).toBe(true);
  });

  it('renders an h2 element when level is 2', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 2, content: 'Test Headline' },
    });
    expect(wrapper.find('h2').exists()).toBe(true);
  });

  it('renders an h3 element when level is 3', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 3, content: 'Test Headline' },
    });
    expect(wrapper.find('h3').exists()).toBe(true);
  });

  it('renders an h4 element when level is 4', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 4, content: 'Test Headline' },
    });
    expect(wrapper.find('h4').exists()).toBe(true);
  });

  it('renders an h5 element when level is 5', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 5, content: 'Test Headline' },
    });
    expect(wrapper.find('h5').exists()).toBe(true);
  });

  it('renders an h6 element when level is 6', () => {
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 6, content: 'Test Headline' },
    });
    expect(wrapper.find('h6').exists()).toBe(true);
  });

  it('displays the content text correctly', () => {
    const content = 'My Amazing Headline';
    const wrapper = mount(VsgBlockHeadline, {
      props: { content },
    });
    expect(wrapper.text()).toBe(content);
  });

  it('displays the content text in the correct heading element', () => {
    const content = 'Section Title';
    const wrapper = mount(VsgBlockHeadline, {
      props: { level: 3, content },
    });
    expect(wrapper.find('h3').text()).toBe(content);
  });
});
