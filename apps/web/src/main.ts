import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faAddressBook,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowRightArrowLeft,
  faArrowRightFromBracket,
  faArrowsRotate,
  faArrowUpRightFromSquare,
  faBolt,
  faCalendar,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronRight,
  faChild,
  faCircle,
  faCircleInfo,
  faClock,
  faCog,
  faCopy,
  faCubes,
  faDownload,
  faEnvelope,
  faEye,
  faFileArrowDown,
  faFolder,
  faFolderPlus,
  faGauge,
  faGrip,
  faHouse,
  faImage,
  faInbox,
  faLocationDot,
  faNewspaper,
  faPenToSquare,
  faPeopleGroup,
  faPerson,
  faPhone,
  faPlus,
  faSitemap,
  faSpinner,
  faTrash,
  faTriangleExclamation,
  faUpload,
  faUser,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowsRotate,
  faArrowRightArrowLeft,
  faArrowRightFromBracket,
  faArrowUpRightFromSquare,
  faBolt,
  faCalendar,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronRight,
  faChild,
  faCircle,
  faCircleInfo,
  faClock,
  faCopy,
  faDownload,
  faEnvelope,
  faEye,
  faFileArrowDown,
  faFolder,
  faFolderPlus,
  faGrip,
  faHouse,
  faImage,
  faInbox,
  faLocationDot,
  faPenToSquare,
  faPeopleGroup,
  faPerson,
  faPhone,
  faPlus,
  faSpinner,
  faTrash,
  faTriangleExclamation,
  faUpload,
  faUser,
  faUsers,
  faXmark,
  // Sidebar icons
  faGauge, // Dashboard
  // faHouse, // Startseite
  faPeopleGroup, // Verein
  faCubes, // Abteilungen
  // faCalendar, // Termine
  faAddressBook, // Kontakte
  faSitemap, // Kategorien
  faNewspaper, // Beiträge
  // faImage, // Mediathek
  // faUsers, // Benutzer
  faCog, // Einstellungen
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app');

document.addEventListener('DOMContentLoaded', () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
    "style-src 'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com;",
    `img-src 'self' data: https: ${import.meta.env.VITE_API_BASE_URL};`,
    "font-src 'self' data: https://maxcdn.bootstrapcdn.com;",
    `connect-src 'self' ${import.meta.env.VITE_API_BASE_URL};`,
  ].join('; ');
  document.head.appendChild(meta);
});
