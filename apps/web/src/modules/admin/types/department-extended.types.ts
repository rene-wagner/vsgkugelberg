// Department Stat Types
export interface DepartmentStat {
  id: number;
  departmentId: number;
  label: string;
  value: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentStatDto {
  label: string;
  value: string;
  sort?: number;
}

export interface UpdateDepartmentStatDto {
  label?: string;
  value?: string;
  sort?: number;
}

// Department Training Types
export interface DepartmentTrainingSession {
  id: number;
  trainingGroupId: number;
  day: string;
  time: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTrainingGroup {
  id: number;
  departmentId: number;
  name: string;
  ageRange: string | null;
  icon: 'youth' | 'adults';
  variant: 'primary' | 'secondary';
  sort: number;
  sessions: DepartmentTrainingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentTrainingGroupDto {
  name: string;
  ageRange?: string | null;
  icon: 'youth' | 'adults';
  variant: 'primary' | 'secondary';
  sort?: number;
}

export interface UpdateDepartmentTrainingGroupDto {
  name?: string;
  ageRange?: string;
  icon?: 'youth' | 'adults';
  variant?: 'primary' | 'secondary';
  sort?: number;
}

export interface CreateDepartmentTrainingSessionDto {
  day: string;
  time: string;
  sort?: number;
}

export interface UpdateDepartmentTrainingSessionDto {
  day?: string;
  time?: string;
  sort?: number;
}

// Department Location Types
export interface LocationAmenity {
  text: string;
}

export interface DepartmentLocation {
  id: number;
  departmentId: number;
  name: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  mapsUrl: string | null;
  amenities: LocationAmenity[];
  imageId: number | null;
  image: ContactPersonMedia | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentLocationDto {
  name: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  mapsUrl?: string | null;
  amenities: LocationAmenity[];
  imageId?: number | null;
  sort?: number;
}

export interface UpdateDepartmentLocationDto {
  name?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary';
  street?: string;
  city?: string;
  mapsUrl?: string;
  amenities?: LocationAmenity[];
  imageId?: number | null;
  sort?: number;
}

// Department Trainer Types
export interface TrainerLicense {
  name: string;
  variant: 'gold' | 'blue';
}

export interface ContactPersonMedia {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  email: string | null;
  address: string | null;
  phone: string;
  profileImageId: number | null;
  profileImage: ContactPersonMedia | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTrainer {
  id: number;
  departmentId: number;
  contactPersonId: number | null;
  role: string;
  licenses: TrainerLicense[];
  sort: number;
  contactPerson: ContactPerson | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentTrainerDto {
  contactPersonId: number;
  role: string;
  licenses: TrainerLicense[];
  sort?: number;
}

export interface UpdateDepartmentTrainerDto {
  role?: string;
  licenses?: TrainerLicense[];
  sort?: number;
}

// Extended Department (for GET /api/departments/:slug response)
export interface DepartmentExtended {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  iconId: number | null;
  icon: ContactPersonMedia | null;
  stats: DepartmentStat[];
  trainingGroups: DepartmentTrainingGroup[];
  locations: DepartmentLocation[];
  trainers: DepartmentTrainer[];
  createdAt: string;
  updatedAt: string;
}
