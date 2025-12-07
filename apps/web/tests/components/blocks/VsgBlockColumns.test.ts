import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockColumns from '@/components/blocks/VsgBlockColumns.vue';

describe('VsgBlockColumns', () => {
  it('renders a div element', () => {
    const wrapper = mount(VsgBlockColumns);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('applies grid styling', () => {
    const wrapper = mount(VsgBlockColumns);
    const div = wrapper.find('div');
    expect(div.classes()).toContain('grid');
  });

  it('applies single column class for mobile by default', () => {
    const wrapper = mount(VsgBlockColumns);
    const div = wrapper.find('div');
    expect(div.classes()).toContain('grid-cols-1');
  });

  it('defaults to 1 column on medium screens when columnCount is not provided', () => {
    const wrapper = mount(VsgBlockColumns);
    const div = wrapper.find('div');
    expect(div.classes()).toContain('md:grid-cols-1');
  });

  it('applies correct column count class for medium screens when columnCount is 2', () => {
    const wrapper = mount(VsgBlockColumns, {
      props: { columnCount: 2 },
    });
    const div = wrapper.find('div');
    expect(div.classes()).toContain('md:grid-cols-2');
  });

  it('applies correct column count class for medium screens when columnCount is 3', () => {
    const wrapper = mount(VsgBlockColumns, {
      props: { columnCount: 3 },
    });
    const div = wrapper.find('div');
    expect(div.classes()).toContain('md:grid-cols-3');
  });

  it('applies correct column count class for medium screens when columnCount is 4', () => {
    const wrapper = mount(VsgBlockColumns, {
      props: { columnCount: 4 },
    });
    const div = wrapper.find('div');
    expect(div.classes()).toContain('md:grid-cols-4');
  });

  it('falls back to 1 column for unsupported column counts', () => {
    const wrapper = mount(VsgBlockColumns, {
      props: { columnCount: 15 },
    });
    const div = wrapper.find('div');
    expect(div.classes()).toContain('md:grid-cols-1');
  });
});
