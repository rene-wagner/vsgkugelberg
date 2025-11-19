<script setup lang="ts">
export type VsgMenuItem = {
  label: string;
  path: string;
};

export type VsgNavigationMenuProps = {
  isDesktop?: boolean;
  menuItems: VsgMenuItem[];
};

withDefaults(defineProps<VsgNavigationMenuProps>(), {
  isDesktop: false,
});
</script>

<template>
  <div />
</template>
