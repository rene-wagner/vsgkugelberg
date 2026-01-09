export interface BreadcrumbItem {
  label: string;
  to?: string;
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresPermission?: string[];
    title?: string;
    breadcrumb?: BreadcrumbItem[];
    transition?: string;
  }
}
