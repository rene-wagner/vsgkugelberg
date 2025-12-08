import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import {
  VsgIconSpinner,
  VsgIconPlus,
  VsgIconTrash,
  VsgIconClose,
  VsgIconChevronRight,
  VsgIconChevronDown,
  VsgIconChevronLeft,
  VsgIconMenu,
  VsgIconEdit,
  VsgIconSave,
  VsgIconBlockSection,
  VsgIconBlockColumns,
  VsgIconBlockColumn,
  VsgIconBlockHeadline,
  VsgIconBlockParagraph,
  VsgIconBlockImage,
} from '@/components/icons';

describe('Icon Components', () => {
  describe('VsgIconSpinner', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconSpinner);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has animate-spin class', () => {
      const wrapper = mount(VsgIconSpinner);
      expect(wrapper.find('svg').classes()).toContain('animate-spin');
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconSpinner);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconSpinner, {
        props: { size: 'w-8 h-8' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-8');
      expect(svg.classes()).toContain('h-8');
    });

    it('passes additional classes', () => {
      const wrapper = mount(VsgIconSpinner, {
        attrs: { class: 'text-red-500' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('text-red-500');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconSpinner);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('VsgIconPlus', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconPlus);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconPlus);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
      expect(svg.attributes('stroke-width')).toBe('2');
      expect(svg.attributes('stroke-linecap')).toBe('round');
      expect(svg.attributes('stroke-linejoin')).toBe('round');
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconPlus);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconPlus, {
        props: { size: 'w-4 h-4' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-4');
      expect(svg.classes()).toContain('h-4');
    });
  });

  describe('VsgIconTrash', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconTrash);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconTrash);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
      expect(svg.attributes('stroke-width')).toBe('2');
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconTrash);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });
  });

  describe('VsgIconClose', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconClose);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconClose);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconClose);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });
  });

  describe('VsgIconChevronRight', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconChevronRight);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconChevronRight);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });
  });

  describe('VsgIconChevronDown', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconChevronDown);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconChevronDown, {
        props: { size: 'h-4 w-4' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-4');
      expect(svg.classes()).toContain('w-4');
    });
  });

  describe('VsgIconChevronLeft', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconChevronLeft);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconChevronLeft);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });
  });

  describe('VsgIconMenu', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconMenu);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconMenu, {
        props: { size: 'h-6 w-6' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-6');
      expect(svg.classes()).toContain('w-6');
    });
  });

  describe('VsgIconEdit', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconEdit);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconEdit);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconEdit);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('VsgIconSave', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconSave);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconSave);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconSave);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
      expect(svg.attributes('stroke-width')).toBe('2');
      expect(svg.attributes('stroke-linecap')).toBe('round');
      expect(svg.attributes('stroke-linejoin')).toBe('round');
    });
  });

  describe('VsgIconBlockSection', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockSection);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockSection);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconBlockSection, {
        props: { size: 'w-6 h-6' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-6');
      expect(svg.classes()).toContain('h-6');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconBlockSection);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('VsgIconBlockColumns', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockColumns);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockColumns);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconBlockColumns);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('VsgIconBlockColumn', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockColumn);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockColumn);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconBlockColumn);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('VsgIconBlockHeadline', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockHeadline);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockHeadline);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconBlockHeadline);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
      const path = wrapper.find('path');
      expect(path.attributes('stroke-width')).toBe('2');
    });
  });

  describe('VsgIconBlockParagraph', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockParagraph);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockParagraph);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('has correct stroke attributes', () => {
      const wrapper = mount(VsgIconBlockParagraph);
      const svg = wrapper.find('svg');
      expect(svg.attributes('stroke')).toBe('currentColor');
      const path = wrapper.find('path');
      expect(path.attributes('stroke-width')).toBe('2');
    });
  });

  describe('VsgIconBlockImage', () => {
    it('renders an SVG element', () => {
      const wrapper = mount(VsgIconBlockImage);
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('has default size classes', () => {
      const wrapper = mount(VsgIconBlockImage);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-5');
      expect(svg.classes()).toContain('h-5');
    });

    it('accepts custom size prop', () => {
      const wrapper = mount(VsgIconBlockImage, {
        props: { size: 'w-8 h-8' },
      });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('w-8');
      expect(svg.classes()).toContain('h-8');
    });

    it('has aria-hidden attribute', () => {
      const wrapper = mount(VsgIconBlockImage);
      expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });
  });
});
