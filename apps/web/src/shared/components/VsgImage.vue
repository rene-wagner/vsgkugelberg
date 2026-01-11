<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  src: string;
  alt: string;
  lazy?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true,
  width: 0,
  height: 0,
  className: '',
});

const imageRef = ref<HTMLImageElement | null>(null);
const isVisible = ref(!props.lazy);
const isLoaded = ref(false);

onMounted(() => {
  if (props.lazy && imageRef.value) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(imageRef.value);

    onUnmounted(() => {
      observer.disconnect();
    });
  }
});

function onLoad() {
  isLoaded.value = true;
}

function onError() {
  isVisible.value = true;
}
</script>

<template>
  <img
    v-if="isVisible"
    ref="imageRef"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :class="className"
    loading="lazy"
    @load="onLoad"
    @error="onError"
  />
</template>
