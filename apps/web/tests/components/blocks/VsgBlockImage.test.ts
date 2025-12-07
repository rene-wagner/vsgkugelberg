import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockImage from '@/components/blocks/VsgBlockImage.vue';

describe('VsgBlockImage', () => {
  it('renders an img element with the src prop', () => {
    const src = 'https://example.com/image.jpg';
    const wrapper = mount(VsgBlockImage, {
      props: { src },
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(src);
  });

  it('renders the alt attribute when provided', () => {
    const wrapper = mount(VsgBlockImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'A beautiful sunset',
      },
    });
    expect(wrapper.find('img').attributes('alt')).toBe('A beautiful sunset');
  });

  it('renders an empty alt attribute when not provided', () => {
    const wrapper = mount(VsgBlockImage, {
      props: { src: 'https://example.com/image.jpg' },
    });
    expect(wrapper.find('img').attributes('alt')).toBe('');
  });

  it('renders the title attribute when provided', () => {
    const wrapper = mount(VsgBlockImage, {
      props: {
        src: 'https://example.com/image.jpg',
        title: 'Click to enlarge',
      },
    });
    expect(wrapper.find('img').attributes('title')).toBe('Click to enlarge');
  });

  it('renders the aria-describedby attribute when provided', () => {
    const wrapper = mount(VsgBlockImage, {
      props: {
        src: 'https://example.com/image.jpg',
        ariaDescribedby: 'image-description-1',
      },
    });
    expect(wrapper.find('img').attributes('aria-describedby')).toBe('image-description-1');
  });

  it('applies loading="lazy" attribute for performance', () => {
    const wrapper = mount(VsgBlockImage, {
      props: { src: 'https://example.com/image.jpg' },
    });
    expect(wrapper.find('img').attributes('loading')).toBe('lazy');
  });

  it('displays fallback UI with alt text on image error', async () => {
    const wrapper = mount(VsgBlockImage, {
      props: {
        src: 'https://example.com/broken-image.jpg',
        alt: 'Broken image description',
      },
    });

    // Trigger the error event on the image
    await wrapper.find('img').trigger('error');

    // Image should be replaced with fallback container
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('div').exists()).toBe(true);
    expect(wrapper.find('div').text()).toBe('Broken image description');
  });

  it('displays generic fallback message when no alt is provided on error', async () => {
    const wrapper = mount(VsgBlockImage, {
      props: { src: 'https://example.com/broken-image.jpg' },
    });

    await wrapper.find('img').trigger('error');

    expect(wrapper.find('div').text()).toBe('Image failed to load');
  });

  it('applies styling classes to the image', () => {
    const wrapper = mount(VsgBlockImage, {
      props: { src: 'https://example.com/image.jpg' },
    });
    const img = wrapper.find('img');
    expect(img.classes()).toContain('max-w-full');
    expect(img.classes()).toContain('h-auto');
  });

  it('applies styling classes to the fallback container', async () => {
    const wrapper = mount(VsgBlockImage, {
      props: { src: 'https://example.com/broken-image.jpg' },
    });

    await wrapper.find('img').trigger('error');

    const fallback = wrapper.find('div');
    expect(fallback.classes()).toContain('bg-gray-100');
    expect(fallback.classes()).toContain('border');
    expect(fallback.classes()).toContain('border-gray-300');
    expect(fallback.classes()).toContain('rounded');
  });
});
