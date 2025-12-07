import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VsgBlockColumn from '@/components/blocks/VsgBlockColumn.vue';

describe('VsgBlockColumn', () => {
  it('renders a div element', () => {
    const wrapper = mount(VsgBlockColumn);
    expect(wrapper.find('div').exists()).toBe(true);
  });
});
