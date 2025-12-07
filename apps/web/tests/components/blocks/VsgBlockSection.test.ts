import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockSection from '@/components/blocks/VsgBlockSection.vue';

describe('VsgBlockSection', () => {
  it('renders a section element', () => {
    const wrapper = mount(VsgBlockSection);
    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('renders without hero styling when isHero is not provided', () => {
    const wrapper = mount(VsgBlockSection);
    const section = wrapper.find('section');
    expect(section.classes()).not.toContain('w-screen');
    expect(section.classes()).not.toContain('h-screen');
    expect(section.classes()).not.toContain('flex');
  });

  it('renders without hero styling when isHero is false', () => {
    const wrapper = mount(VsgBlockSection, {
      props: { isHero: false },
    });
    const section = wrapper.find('section');
    expect(section.classes()).not.toContain('w-screen');
    expect(section.classes()).not.toContain('h-screen');
    expect(section.classes()).not.toContain('flex');
  });

  it('applies viewport dimension classes when isHero is true', () => {
    const wrapper = mount(VsgBlockSection, {
      props: { isHero: true },
    });
    const section = wrapper.find('section');
    expect(section.classes()).toContain('w-screen');
    expect(section.classes()).toContain('h-screen');
  });

  it('applies flexbox centering classes when isHero is true', () => {
    const wrapper = mount(VsgBlockSection, {
      props: { isHero: true },
    });
    const section = wrapper.find('section');
    expect(section.classes()).toContain('flex');
    expect(section.classes()).toContain('items-center');
    expect(section.classes()).toContain('justify-center');
  });
});
