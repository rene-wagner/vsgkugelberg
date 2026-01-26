/**
 * Type definitions for VsgDataTable component
 */

import type { VNode } from 'vue';

/**
 * Column definition for data table
 */
export interface Column<T = any> {
  /** Unique key for the column (must match property in data item) */
  key: string;

  /** Display label for column header */
  label: string;

  /** Text alignment for column */
  align?: 'left' | 'right' | 'center';

  /** Fixed width for column (e.g., '100px', '10rem', 'w-16') */
  width?: string;

  /** Whether column is sortable (future feature) */
  sortable?: boolean;

  /** Custom render function for cell content */
  render?: (item: T) => string | number | boolean | VNode;

  /** Custom CSS classes for cells in this column */
  class?: string | ((item: T) => string);
}

/**
 * Action button configuration for row actions
 */
export interface ActionButton<T = any> {
  /** Type of action */
  type: 'edit' | 'delete' | 'custom';

  /** FontAwesome icon name (without 'fa-' prefix) */
  icon?: string;

  /** Tooltip text for the action button */
  title?: string;

  /** Router link path (for edit type) - function receives the item */
  to?: string | ((item: T) => string);

  /** Click handler (for delete/custom types) */
  onClick?: (item: T) => void | Promise<void>;

  /** Visual variant of the button */
  variant?: 'primary' | 'danger' | 'secondary';

  /** Conditional visibility - function receives the item */
  visible?: (item: T) => boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Total number of items */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Props interface for VsgDataTable component
 */
export interface DataTableProps<T = any> {
  // Header configuration
  /** Table title */
  title: string;

  /** Optional description below title */
  description?: string;

  /** Text for add button */
  addButtonText?: string;

  /** Route for add button */
  addButtonRoute?: string;

  // Data configuration
  /** Array of items to display */
  items: T[];

  /** Column definitions */
  columns: Column<T>[];

  /** Property name to use as row key (default: 'id') */
  rowKey?: string;

  // State management
  /** Loading state */
  loading?: boolean;

  /** Error message */
  error?: string | null;

  // Empty state configuration
  /** Message to display when no items */
  emptyMessage?: string;

  /** Text for empty state action link */
  emptyActionText?: string;

  /** Route for empty state action link */
  emptyActionRoute?: string;

  // Actions configuration
  /** Row action buttons configuration */
  actions?: ActionButton<T>[];

  // Pagination configuration
  /** Pagination metadata (if null/undefined, shows simple count) */
  pagination?: PaginationMeta | null;

  // Customization
  /** Custom CSS classes for rows */
  rowClass?: string | ((item: T) => string);
}
