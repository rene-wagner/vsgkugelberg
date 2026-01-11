<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration,
  type ChartData,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Filler, Tooltip, Legend);

const props = defineProps<{
  data: ChartData<'line'>;
  options?: any;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const renderChart = () => {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#002d5c', font: { family: 'Source Sans 3' } },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#002d5c', font: { family: 'Source Sans 3' } },
        },
      },
      ...props.options,
    },
  };

  chartInstance = new Chart(canvasRef.value, config);
};

onMounted(() => {
  renderChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);
</script>

<template>
  <div class="h-full w-full">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
