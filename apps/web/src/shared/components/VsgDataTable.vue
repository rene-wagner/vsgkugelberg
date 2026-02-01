<script setup lang="ts" generic="T extends Record<string, any>">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgPagination from './VsgPagination.vue';
import AdminAlert from '@/modules/admin/components/AdminAlert.vue';
import AdminPageHeader from '@/modules/admin/components/AdminPageHeader.vue';
import AdminLoadingState from '@/modules/admin/components/AdminLoadingState.vue';
import type { Column, ActionButton, PaginationMeta } from '@/shared/types/table.types';

interface Props {
  // Header configuration
  title: string;
  description?: string;
  addButtonText?: string;
  addButtonRoute?: string;

  // Data configuration
  items: T[];
  columns: Column<T>[];
  rowKey?: string;

  // State management
  loading?: boolean;
  error?: string | null;

  // Empty state configuration
  emptyMessage?: string;
  emptyActionText?: string;
  emptyActionRoute?: string;

  // Actions configuration
  actions?: ActionButton<T>[];

  // Pagination configuration
  pagination?: PaginationMeta | null;

  // Customization
  rowClass?: string | ((item: T) => string);
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  loading: false,
  error: null,
  emptyMessage: 'Keine Einträge vorhanden.',
  pagination: null,
});

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
  (e: 'row-click', item: T): void;
}>();

/**
 * Render cell content based on column configuration
 */
function renderCell(item: T, column: Column<T>): any {
  if (column.render) {
    return column.render(item);
  }
  return item[column.key];
}

/**
 * Get cell classes based on column configuration
 */
function getCellClass(item: T, column: Column<T>): string {
  const classes = ['px-6', 'py-4'];

  if (column.align === 'right') {
    classes.push('text-right');
  } else if (column.align === 'center') {
    classes.push('text-center');
  } else {
    classes.push('text-left');
  }

  if (typeof column.class === 'function') {
    classes.push(column.class(item));
  } else if (typeof column.class === 'string') {
    classes.push(column.class);
  }

  return classes.join(' ');
}

/**
 * Get row classes based on configuration
 */
function getRowClass(item: T): string {
  const classes = ['hover:bg-gray-50', 'transition-colors'];

  if (typeof props.rowClass === 'function') {
    classes.push(props.rowClass(item));
  } else if (typeof props.rowClass === 'string') {
    classes.push(props.rowClass);
  }

  return classes.join(' ');
}

/**
 * Check if action should be visible
 */
function isActionVisible(action: ActionButton<T>, item: T): boolean {
  if (action.visible) {
    return action.visible(item);
  }
  return true;
}

/**
 * Get action icon based on type
 */
function getActionIcon(action: ActionButton<T>): string {
  if (action.icon) {
    return action.icon;
  }

  switch (action.type) {
    case 'edit':
      return 'pen-to-square';
    case 'delete':
      return 'trash';
    default:
      return 'ellipsis-h';
  }
}

/**
 * Get action CSS classes based on variant
 */
function getActionClass(action: ActionButton<T>): string {
  const baseClasses = 'p-2 transition-colors';

  const variant = action.variant || (action.type === 'delete' ? 'danger' : 'secondary');

  switch (variant) {
    case 'primary':
      return `${baseClasses} text-vsg-blue-600 hover:text-vsg-blue-700`;
    case 'danger':
      return `${baseClasses} text-gray-400 hover:text-red-500`;
    case 'secondary':
    default:
      return `${baseClasses} text-gray-400 hover:text-vsg-blue-600`;
  }
}

/**
 * Get action link (for edit actions)
 */
function getActionLink(action: ActionButton<T>, item: T): string | undefined {
  if (action.type === 'edit' && action.to) {
    return typeof action.to === 'function' ? action.to(item) : action.to;
  }
  return undefined;
}

/**
 * Handle action click
 */
function handleActionClick(action: ActionButton<T>, item: T): void {
  if (action.onClick) {
    action.onClick(item);
  }
}

/**
 * Handle page change from pagination
 */
function handlePageChange(page: number): void {
  emit('page-change', page);
}
</script>

<template>
  <div>
    <AdminPageHeader
      :title="title"
      :description="description"
    >
      <template #actions>
        <slot name="header-actions" />
        <router-link
          v-if="addButtonRoute"
          :to="addButtonRoute"
          class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
        >
          {{ addButtonText }}
        </router-link>
      </template>
    </AdminPageHeader>

    <!-- Loading State -->
    <slot
      v-if="loading"
      name="loading"
    >
      <AdminLoadingState />
    </slot>

    <!-- Error State -->
    <AdminAlert
      v-else-if="error"
      variant="error"
      class="mb-6"
    >
      <slot
        name="error"
        :error="error"
      >
        <span class="text-sm text-red-600 font-body">{{ error }}</span>
      </slot>
    </AdminAlert>

    <!-- Table -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase',
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                  column.width,
                ]"
              >
                {{ column.label }}
              </th>
              <th
                v-if="actions && actions.length > 0"
                class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in items"
              :key="item[rowKey]"
              :class="getRowClass(item)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :class="getCellClass(item, column)"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :item="item"
                  :column="column"
                >
                  <span
                    v-if="column.key === 'title' || column.key === 'name' || column.key === 'username'"
                    class="font-body text-sm text-vsg-blue-900 font-medium"
                  >
                    {{ renderCell(item, column) }}
                  </span>
                  <span
                    v-else
                    class="font-body font-normal text-sm text-gray-600"
                  >
                    {{ renderCell(item, column) }}
                  </span>
                </slot>
              </td>
              <td
                v-if="actions && actions.length > 0"
                class="px-6 py-4"
              >
                <slot
                  name="row-actions"
                  :item="item"
                >
                  <div class="flex items-center justify-end gap-2">
                    <template
                      v-for="(action, index) in actions"
                      :key="index"
                    >
                      <router-link
                        v-if="action.type === 'edit' && isActionVisible(action, item)"
                        :to="getActionLink(action, item)!"
                        :class="getActionClass(action)"
                        :title="action.title || 'Bearbeiten'"
                      >
                        <FontAwesomeIcon :icon="getActionIcon(action)" />
                      </router-link>
                      <button
                        v-else-if="isActionVisible(action, item)"
                        :class="getActionClass(action)"
                        :title="action.title || (action.type === 'delete' ? 'Löschen' : '')"
                        @click="handleActionClick(action, item)"
                      >
                        <FontAwesomeIcon :icon="getActionIcon(action)" />
                      </button>
                    </template>
                  </div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-if="items.length === 0"
        class="px-6 py-12 text-center"
      >
        <slot name="empty">
          <p class="font-body text-gray-500">{{ emptyMessage }}</p>
          <router-link
            v-if="emptyActionRoute"
            :to="emptyActionRoute"
            class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm"
          >
            {{ emptyActionText }}
          </router-link>
        </slot>
      </div>

      <!-- Pagination -->
      <VsgPagination
        v-if="pagination && items.length > 0"
        :meta="pagination"
        @page-change="handlePageChange"
      />

      <!-- Simple Count (no pagination) -->
      <div
        v-else-if="!pagination && items.length > 0"
        class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="font-body font-normal text-sm text-gray-500">
          Zeige
          <span class="text-vsg-blue-900 font-medium">{{ items.length }}</span>
          {{ items.length === 1 ? 'Eintrag' : 'Einträge' }}
        </div>
      </div>
    </div>
  </div>
</template>
