<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import VsgHeroSection from '../components/VsgHeroSection.vue';
import StatsSection from '../components/StatsSection.vue';
import DepartmentsSection from '../components/DepartmentsSection.vue';
import NewsSection from '../components/NewsSection.vue';
import CtaSection from '../components/CtaSection.vue';
import { useHomepageContentStore } from '../stores/homepageContentStore';

const homepageContentStore = useHomepageContentStore();
const { homepageContent } = storeToRefs(homepageContentStore);

onMounted(() => {
  homepageContentStore.fetchHomepageContent();
});
</script>

<template>
  <div>
    <VsgHeroSection
      :headline="homepageContent?.heroHeadline"
      :description="homepageContent?.heroDescription"
      :tag="homepageContent?.heroTag"
      :logo="homepageContent?.heroLogo ?? null"
      min-height="screen"
      :show-scroll-indicator="true"
    />

    <StatsSection :stats="homepageContent?.stats" />

    <DepartmentsSection
      :headline="homepageContent?.departmentsHeadline"
      :description="homepageContent?.departmentsDescription"
      :subtitle="homepageContent?.departmentsSubtitle"
    />

    <NewsSection
      :headline="homepageContent?.postsHeadline"
      :description="homepageContent?.postsDescription"
      :subtitle="homepageContent?.postsSubtitle"
      :posts-count="homepageContent?.postsCount ?? 5"
    />

    <CtaSection
      :headline="homepageContent?.ctaHeadline"
      :description="homepageContent?.ctaDescription"
    />
  </div>
</template>
