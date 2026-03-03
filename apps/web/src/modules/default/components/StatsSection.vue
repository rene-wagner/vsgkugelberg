<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { HomepageStat } from '@/shared/types/homepage-content.types';

interface Props {
  stats?: HomepageStat[];
}

const props = defineProps<Props>();

const displayStats = computed(() => props.stats ?? []);

// ---------------------------------------------------------------------------
// Viewport detection (one-shot IntersectionObserver)
// ---------------------------------------------------------------------------
const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
        observer = null;
      }
    },
    { threshold: 0.2 },
  );

  observer.observe(sectionRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
  // Cancel any running animation frames
  for (const handle of rafHandles) {
    cancelAnimationFrame(handle);
  }
  rafHandles.clear();
});

// ---------------------------------------------------------------------------
// Per-stat animation state (managed here, not inside a composable loop)
// ---------------------------------------------------------------------------

interface StatEntry {
  label: string;
  numericTarget: number | null;
  suffix: string;
  rawValue: string;
  displayValue: number;
}

/**
 * Extract a leading numeric part and any trailing suffix.
 * "500+"  → { numericTarget: 500, suffix: "+" }
 * "1.200" → { numericTarget: 1200, suffix: "" }  (parseFloat handles this)
 * "n/a"   → { numericTarget: null, suffix: "" }
 */
function parseStatValue(value: string): { numericTarget: number | null; suffix: string } {
  const parsed = parseFloat(value.replace(',', '.'));
  if (isNaN(parsed)) {
    return { numericTarget: null, suffix: '' };
  }
  const match = value.match(/^[\d.,]+/);
  const suffix = match ? value.slice(match[0].length) : '';
  return { numericTarget: parsed, suffix };
}

const statEntries = ref<StatEntry[]>([]);

// RAF handles keyed by stat index so we can cancel individually on unmount
const rafHandles = new Set<number>();

function easeOut(t: number) {
  return t * (2 - t);
}

function animateStat(index: number, target: number, duration = 1500) {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    statEntries.value[index].displayValue = target;
    return;
  }

  const startTime = performance.now();

  function tick(now: number) {
    if (!statEntries.value[index]) return;

    const progress = Math.min((now - startTime) / duration, 1);
    statEntries.value[index].displayValue = Math.round(easeOut(progress) * target);

    if (progress < 1) {
      const handle = requestAnimationFrame(tick);
      rafHandles.add(handle);
    } else {
      statEntries.value[index].displayValue = target;
    }
  }

  const handle = requestAnimationFrame(tick);
  rafHandles.add(handle);
}

// Build plain (non-reactive) entry objects whenever stats are loaded.
// This watch is safe because it only touches plain data — no lifecycle hooks.
watch(
  displayStats,
  (stats) => {
    statEntries.value = stats.map((stat) => {
      const { numericTarget, suffix } = parseStatValue(stat.value);
      return {
        label: stat.label,
        numericTarget,
        suffix,
        rawValue: stat.value,
        displayValue: 0,
      };
    });

    // If the section is already visible when stats load, start animations now.
    if (isVisible.value) {
      startAnimations();
    }
  },
  { immediate: true },
);

function startAnimations() {
  statEntries.value.forEach((entry, index) => {
    if (entry.numericTarget !== null) {
      animateStat(index, entry.numericTarget);
    } else {
      // Non-numeric: no animation needed, just display raw value
    }
  });
}

// Start animations when section enters viewport (stats may already be loaded).
watch(isVisible, (visible) => {
  if (visible && statEntries.value.length > 0) {
    startAnimations();
  }
});
</script>

<template>
  <section
    ref="sectionRef"
    class="relative bg-gray-50 py-20"
  >
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div
          v-for="(entry, index) in statEntries"
          :key="entry.label"
          class="animate-scale-in text-center"
          :class="`delay-${(index + 1) * 100}`"
        >
          <span class="font-display text-6xl text-vsg-blue-600 md:text-8xl">
            <template v-if="entry.numericTarget !== null"> {{ entry.displayValue }}{{ entry.suffix }} </template>
            <template v-else>
              {{ entry.rawValue }}
            </template>
          </span>
          <span class="mt-2 block font-body text-sm font-normal uppercase tracking-widest text-vsg-blue-800">
            {{ entry.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
