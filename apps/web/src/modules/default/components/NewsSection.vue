<script setup lang="ts">
import VsgSectionHeader from '@shared/components/VsgSectionHeader.vue';
import VsgLinkArrow from '@shared/components/VsgLinkArrow.vue';
import NewsCardFeatured from './NewsCardFeatured.vue';
import NewsCardListItem from './NewsCardListItem.vue';

interface NewsItem {
  date: string;
  title: string;
  href: string;
}

const featuredNews = {
  category: 'FUSSBALL',
  date: '15. Dezember 2024',
  title: 'AUFSTIEG IN DIE LANDESKLASSE PERFEKT!',
  excerpt:
    'Mit einem souveränen 3:1 Sieg gegen den TSV Merseburg sichert sich unsere erste Mannschaft den lang ersehnten Aufstieg.',
  href: '#',
};

const newsItems: NewsItem[] = [
  {
    date: '12. Dezember 2024',
    title: 'Jugendtraining startet wieder – Neue Zeiten ab Januar',
    href: '#',
  },
  {
    date: '10. Dezember 2024',
    title: 'Weihnachtsfeier am 21.12. – Alle Mitglieder herzlich eingeladen',
    href: '#',
  },
  {
    date: '8. Dezember 2024',
    title: 'Neue Trikots für die Volleyball-Abteilung eingetroffen',
    href: '#',
  },
  {
    date: '5. Dezember 2024',
    title: 'Hallenturnier der E-Jugend ein voller Erfolg',
    href: '#',
  },
];
</script>

<template>
  <section class="relative bg-gray-50 py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div
        class="mb-16 flex flex-col md:flex-row md:items-end md:justify-between"
      >
        <VsgSectionHeader subtitle="Aktuelles" title="NEWS" :centered="false" />
        <VsgLinkArrow href="#" class="mt-6 md:mt-0">
          Alle Neuigkeiten
        </VsgLinkArrow>
      </div>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- Featured News -->
        <NewsCardFeatured
          :category="featuredNews.category"
          :date="featuredNews.date"
          :title="featuredNews.title"
          :excerpt="featuredNews.excerpt"
          :href="featuredNews.href"
        />

        <!-- News List -->
        <div class="space-y-6">
          <NewsCardListItem
            v-for="item in newsItems"
            :key="item.title"
            :date="item.date"
            :title="item.title"
            :href="item.href"
          />
        </div>
      </div>
    </div>
  </section>
</template>
