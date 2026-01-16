<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  encrypted: string;
  type?: 'email' | 'phone';
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'email',
  placeholder: 'Kontakt laden...',
});

const isDecoded = ref(false);
const decodedValue = ref('');

const protocol = computed(() => (props.type === 'phone' ? 'tel:' : 'mailto:'));

const currentHref = computed(() => {
  if (!isDecoded.value) return '#';
  return `${protocol.value}${decodedValue.value}`;
});

function decode() {
  if (isDecoded.value) return;

  try {
    decodedValue.value = atob(props.encrypted);
    isDecoded.value = true;
  } catch (error) {
    console.error('Failed to decode secure contact info:', error);
    decodedValue.value = 'Fehler beim Laden';
    isDecoded.value = true;
  }
}

function handleClick(event: MouseEvent) {
  if (!isDecoded.value) {
    event.preventDefault();
    decode();

    // Small timeout to allow href to update before navigation trigger
    setTimeout(() => {
      const target = event.target as HTMLAnchorElement;
      if (target && target.href && target.href !== '#' && !target.href.endsWith('#')) {
        window.location.href = target.href;
      }
    }, 50);
  }
}
</script>

<template>
  <a
    :href="currentHref"
    class="cursor-pointer transition-colors duration-200"
    @mouseover="decode"
    @focus="decode"
    @click="handleClick"
  >
    <slot
      v-if="isDecoded"
      :value="decodedValue"
    >
      {{ decodedValue }}
    </slot>
    <slot
      v-else
      name="placeholder"
    >
      {{ placeholder }}
    </slot>
  </a>
</template>
