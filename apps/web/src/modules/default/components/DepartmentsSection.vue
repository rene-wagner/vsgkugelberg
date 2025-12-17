<script setup lang="ts">
import VsgSectionHeader from '@shared/components/VsgSectionHeader.vue';
import DepartmentCard from './DepartmentCard.vue';

interface Department {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const departments: Department[] = [
  {
    title: 'BADMINTON',
    description:
      'Schnelligkeit und Präzision – Badminton für alle Spielstärken.',
    href: '#',
    icon: 'badminton',
  },
  {
    title: 'GYMNASTIK',
    description: 'Beweglichkeit und Fitness – Gymnastik für jedes Alter.',
    href: '#',
    icon: 'gymnastik',
  },
  {
    title: 'TISCHTENNIS',
    description: 'Reaktion und Taktik – spannende Duelle an der Platte.',
    href: '#',
    icon: 'tischtennis',
  },
  {
    title: 'VOLLEYBALL',
    description:
      'Teamgeist und Dynamik – unsere Volleyballer zeigen vollen Einsatz.',
    href: '#',
    icon: 'volleyball',
  },
];
</script>

<template>
  <section class="relative bg-white py-32">
    <div class="mx-auto max-w-7xl px-6">
      <VsgSectionHeader
        subtitle="Unsere Abteilungen"
        title="ABTEILUNGEN"
        class="mb-20"
      />

      <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <!-- Badminton -->
        <DepartmentCard
          :title="departments[0].title"
          :description="departments[0].description"
          :href="departments[0].href"
        >
          <template #icon>
            <svg
              class="h-8 w-8 text-vsg-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              />
            </svg>
          </template>
        </DepartmentCard>

        <!-- Gymnastik -->
        <DepartmentCard
          :title="departments[1].title"
          :description="departments[1].description"
          :href="departments[1].href"
        >
          <template #icon>
            <svg
              class="h-8 w-8 text-vsg-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"
              />
            </svg>
          </template>
        </DepartmentCard>

        <!-- Tischtennis -->
        <DepartmentCard
          :title="departments[2].title"
          :description="departments[2].description"
          :href="departments[2].href"
        >
          <template #icon>
            <svg
              class="h-8 w-8 text-vsg-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15c-.3.9-.7 1.7-1.3 2.4l1.4 1.4c.8-1 1.4-2.2 1.8-3.4l-1.9-.4zM4.6 9c.3-.9.7-1.7 1.3-2.4L4.5 5.2c-.8 1-1.4 2.2-1.8 3.4L4.6 9zM12 4c.9 0 1.8.1 2.6.4l.5-1.9C14.1 2.2 13.1 2 12 2s-2.1.2-3.1.5l.5 1.9c.8-.3 1.7-.4 2.6-.4zM5.2 4.5L6.6 5.9c.7-.6 1.5-1 2.4-1.3l-.4-1.9c-1.2.4-2.4 1-3.4 1.8zM12 20c-.9 0-1.8-.1-2.6-.4l-.5 1.9c1 .3 2 .5 3.1.5s2.1-.2 3.1-.5l-.5-1.9c-.8.3-1.7.4-2.6.4zM18.8 19.5l-1.4-1.4c-.7.6-1.5 1-2.4 1.3l.4 1.9c1.2-.4 2.4-1 3.4-1.8z"
              />
            </svg>
          </template>
        </DepartmentCard>

        <!-- Volleyball -->
        <DepartmentCard
          :title="departments[3].title"
          :description="departments[3].description"
          :href="departments[3].href"
        >
          <template #icon>
            <svg
              class="h-8 w-8 text-vsg-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </template>
        </DepartmentCard>
      </div>
    </div>
  </section>
</template>
