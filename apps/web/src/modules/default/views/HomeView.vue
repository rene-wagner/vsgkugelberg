<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import HeroSection from '../components/HeroSection.vue';
import StatsSection from '../components/StatsSection.vue';
import DepartmentsSection from '../components/DepartmentsSection.vue';
import NewsSection from '../components/NewsSection.vue';
import CtaSection from '../components/CtaSection.vue';
import { useHomepageContentStore } from '../stores/homepageContentStore';

const homepageContentStore = useHomepageContentStore();
const { homepageContent, isLoading, error } = storeToRefs(homepageContentStore);

onMounted(() => {
  homepageContentStore.fetchHomepageContent();
});
</script>

<template>
  <div>
    <HeroSection
      :headline="homepageContent?.heroHeadline"
      :description="homepageContent?.heroDescription"
      :tag="homepageContent?.heroTag"
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
