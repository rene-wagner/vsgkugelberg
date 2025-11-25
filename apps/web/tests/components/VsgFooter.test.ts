import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgFooter from '@/components/VsgFooter.vue';

describe('VsgFooter', () => {
  it('renders the footer element', () => {
    const wrapper = mount(VsgFooter, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.find('footer').exists()).toBe(true);
  });

  it('displays the current year in copyright notice', () => {
    const wrapper = mount(VsgFooter, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    const currentYear = new Date().getFullYear();
    expect(wrapper.text()).toContain(`${currentYear}`);
    expect(wrapper.text()).toContain('VSG Kugelberg e.V.');
  });

  it('displays contact information', () => {
    const wrapper = mount(VsgFooter, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Kontakt');
    expect(wrapper.text()).toContain('Sportverein e.V.');
  });

  it('renders navigation links', () => {
    const wrapper = mount(VsgFooter, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Impressum');
    expect(wrapper.text()).toContain('Datenschutz');
  });
});
