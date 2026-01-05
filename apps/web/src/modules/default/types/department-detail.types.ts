// Training Schedule Types
export interface TrainingSession {
  day: string; // e.g., "Montag"
  time: string; // e.g., "16:00 - 17:30"
  group: string; // e.g., "Anfanger"
  level: 'beginner' | 'intermediate' | 'advanced' | 'all' | 'competition';
}

export interface TrainingGroup {
  name: string; // e.g., "Kinder & Jugend"
  ageRange: string; // e.g., "6 - 17 Jahre"
  icon: 'youth' | 'adults'; // Icon type for the header
  sessions: TrainingSession[];
  note?: string; // Optional info box content
  variant: 'primary' | 'secondary';
}

// Location Types
export interface LocationAmenity {
  icon: 'tables' | 'changing-rooms' | 'parking' | 'info' | 'check';
  text: string;
}

export interface DepartmentLocation {
  id: number;
  name: string; // e.g., "Sporthalle Kugelberg"
  badge: string; // e.g., "Haupthalle"
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  amenities: LocationAmenity[];
  mapsUrl: string | null;
  image?: {
    filename: string;
    originalName: string;
  } | null;
}

// Trainer Types
export interface TrainerLicense {
  name: string; // e.g., "DTTB C-Lizenz"
  variant: 'gold' | 'blue';
}

export interface Trainer {
  name: string;
  role: string; // e.g., "Abteilungsleiter & Cheftrainer"
  licenses: TrainerLicense[];
  contactPersonId?: number; // ID for pre-selecting contact person on contact page
  avatarUrl?: string; // Optional; shows placeholder if not provided
}

// CTA Section Types
export interface DepartmentCta {
  title: string; // e.g., "LUST AUF TISCHTENNIS?"
  description: string; // Invitation text
  primaryCtaLabel: string;
  primaryCtaRoute: string;
  secondaryCtaLabel: string;
  secondaryCtaRoute: string;
}

// Stats Types
export interface Stat {
  value: string;
  label: string;
}
