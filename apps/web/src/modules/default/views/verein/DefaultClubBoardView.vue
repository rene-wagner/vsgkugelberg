<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useBoardContentStore } from '../../stores/boardContentStore';
import VsgHeroSection from '../../components/VsgHeroSection.vue';

const boardContentStore = useBoardContentStore();

onMounted(async () => {
  await boardContentStore.fetchBoardContent();
});

const sortedBoardMembers = computed(() => {
  if (!boardContentStore.boardContent) return [];
  return [...boardContentStore.boardContent.boardMembers].sort((a, b) => a.sort - b.sort);
});

function getProfileImageUrl(filename: string): string {
  return `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
}

// Get badge color based on position
function getBadgeColor(index: number): string {
  return index === 0 ? 'bg-vsg-gold-400' : 'bg-vsg-blue-200';
}
</script>

<template>
  <div>
    <VsgHeroSection
      :headline="boardContentStore.boardContent?.headline || 'VORSTAND'"
      :description="boardContentStore.boardContent?.description || 'Die Führung des VSG Kugelberg'"
      min-height="70vh"
    />

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <!-- Loading State -->
        <div
          v-if="boardContentStore.isLoading"
          class="flex items-center justify-center py-12"
        >
          <div class="text-vsg-blue-600 font-body">Laden...</div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="boardContentStore.error"
          class="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <p class="text-red-600 font-body">{{ boardContentStore.error }}</p>
        </div>

        <!-- Content -->
        <div
          v-else-if="boardContentStore.boardContent"
          class="space-y-12"
        >
          <!-- Introduction -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">
              {{ boardContentStore.boardContent.sectionHeadline }}
            </h2>
            <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              {{ boardContentStore.boardContent.sectionDescription }}
            </p>
          </div>

          <!-- Board Members -->
          <div
            v-if="sortedBoardMembers.length > 0"
            class="border-t border-vsg-blue-100 pt-12"
          >
            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <div
                v-for="(member, index) in sortedBoardMembers"
                :key="member.id"
                class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6"
              >
                <div class="flex items-start gap-4">
                  <!-- Profile Image -->
                  <div class="shrink-0">
                    <div
                      v-if="member.profileImage"
                      class="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200"
                    >
                      <img
                        :src="getProfileImageUrl(member.profileImage.filename)"
                        :alt="`${member.firstName} ${member.lastName}`"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                      :class="getBadgeColor(index)"
                    >
                      <FontAwesomeIcon
                        icon="user"
                        class="text-vsg-blue-900"
                      />
                    </div>
                  </div>

                  <!-- Member Info -->
                  <div>
                    <span
                      class="inline-block rounded-full px-3 py-1 text-sm font-body text-vsg-blue-900"
                      :class="getBadgeColor(index)"
                    >
                      {{ member.type }}
                    </span>
                    <p class="mt-2 font-body text-lg font-semibold text-vsg-blue-900">{{ member.firstName }} {{ member.lastName }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Members Message -->
          <div
            v-else
            class="border-t border-vsg-blue-100 pt-12"
          >
            <div class="rounded-xl bg-gray-50 border border-gray-200 p-8 text-center">
              <p class="font-body text-gray-600">Derzeit sind keine Vorstandsmitglieder hinterlegt.</p>
            </div>
          </div>

          <!-- Contact Note -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <div class="rounded-xl bg-vsg-blue-50 border border-vsg-blue-100 p-6">
              <p class="font-body text-lg text-vsg-blue-700 whitespace-pre-line">
                {{ boardContentStore.boardContent.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
