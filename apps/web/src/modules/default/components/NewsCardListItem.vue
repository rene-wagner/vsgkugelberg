<script setup lang="ts">
interface Props {
  date: string;
  title: string;
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '#',
});
</script>

<template>
  <a :href="href" class="card-hover group block border-l-4 border-vsg-blue-600 bg-gray-50 p-6">
    <span class="font-body text-sm font-normal text-vsg-blue-500">
      {{ date }}
    </span>
    <h5 class="mt-1 font-display text-xl tracking-wider text-vsg-blue-900 transition-colors group-hover:text-vsg-blue-600">
      {{ title }}
    </h5>
  </a>
</template>
