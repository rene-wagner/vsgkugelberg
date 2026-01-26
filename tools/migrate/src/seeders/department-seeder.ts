import ora from 'ora';
import type { Client } from 'pg';
import { loadDepartmentSeedData, logger } from '../utils';
import type { DepartmentMap, LocationMap, TrainingGroupMap, MediaFileMap } from '../types';

// Department slug to icon filename mapping (without extension)
const DEPARTMENT_ICON_MAPPING: Record<string, string> = {
  'badminton': 'badminton',
  'gymnastik': 'gymnastics',
  'tischtennis': 'tabletennis',
  'volleyball': 'volleyball',
};

// Location name to filename mapping (without extension)
const LOCATION_IMAGE_MAPPING: Record<string, string> = {
  'Sporthalle Albert-Einstein-Schule': 'alberteinsteinschule',
  'Sporthalle Beuditzschule': 'beuditzschule',
  'Sporthalle Goethegymnasium': 'goethegymnasium',
  'Sporthalle Ökowegschule': 'oekowegschule',
  'Schlossgartenturnhalle': 'schlossgartenturnhalle',
  'Stadthalle': 'stadthalle',
};

async function seedDepartments(pgClient: Client): Promise<DepartmentMap> {
  const departments = await loadDepartmentSeedData();
  const departmentMap: DepartmentMap = new Map();

  for (const dept of departments) {
    const result = await pgClient.query(
      `INSERT INTO "Department" ("name", "slug", "shortDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT ("slug") DO UPDATE SET
         "name" = EXCLUDED."name",
         "shortDescription" = EXCLUDED."shortDescription",
         "updatedAt" = NOW()
       RETURNING id`,
      [dept.name, dept.slug, dept.shortDescription],
    );

    departmentMap.set(dept.slug, result.rows[0].id);
  }

  return departmentMap;
}

async function seedDepartmentStats(
  pgClient: Client,
  departmentMap: DepartmentMap,
): Promise<number> {
  const departments = await loadDepartmentSeedData();
  let seededCount = 0;

  for (const dept of departments) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      logger.warning(`Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing stats for idempotency
    await pgClient.query(`DELETE FROM "DepartmentStat" WHERE "departmentId" = $1`, [departmentId]);

    for (const stat of dept.stats) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentStat" ("departmentId", "label", "value", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [departmentId, stat.label, stat.value, stat.sort],
      );

      if (result.rows.length > 0) {
        seededCount++;
      }
    }
  }

  return seededCount;
}

async function seedDepartmentLocations(
  pgClient: Client,
  departmentMap: DepartmentMap,
): Promise<LocationMap> {
  const departments = await loadDepartmentSeedData();
  const locationMap: LocationMap = new Map();

  for (const dept of departments) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      logger.warning(`Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing locations for idempotency
    await pgClient.query(`DELETE FROM "DepartmentLocation" WHERE "departmentId" = $1`, [
      departmentId,
    ]);

    const deptLocationMap = new Map<string, number>();
    locationMap.set(dept.slug, deptLocationMap);

    for (const location of dept.locations) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentLocation" ("departmentId", "name", "badge", "badgeVariant", "street", "city", "mapsUrl", "amenities", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING id`,
        [
          departmentId,
          location.name,
          location.badge,
          location.badgeVariant,
          location.street,
          location.city,
          location.mapsUrl,
          JSON.stringify(location.amenities),
          location.sort,
        ],
      );

      if (result.rows.length > 0) {
        deptLocationMap.set(location.name, result.rows[0].id);
      }
    }
  }

  return locationMap;
}

async function seedDepartmentTrainingGroups(
  pgClient: Client,
  departmentMap: DepartmentMap,
): Promise<TrainingGroupMap> {
  const departments = await loadDepartmentSeedData();
  const trainingGroupMap: TrainingGroupMap = new Map();

  for (const dept of departments) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      logger.warning(`Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing training groups (cascade deletes sessions)
    await pgClient.query(`DELETE FROM "DepartmentTrainingGroup" WHERE "departmentId" = $1`, [
      departmentId,
    ]);

    const deptGroupMap = new Map<string, number>();
    trainingGroupMap.set(dept.slug, deptGroupMap);

    for (const group of dept.trainingGroups) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentTrainingGroup" ("departmentId", "name", "ageRange", "icon", "variant", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [departmentId, group.name, group.ageRange, group.icon, group.variant, group.sort],
      );

      if (result.rows.length > 0) {
        deptGroupMap.set(group.name, result.rows[0].id);
      }
    }
  }

  return trainingGroupMap;
}

async function seedDepartmentTrainingSessions(
  pgClient: Client,
  locationMap: LocationMap,
  trainingGroupMap: TrainingGroupMap,
): Promise<number> {
  const departments = await loadDepartmentSeedData();
  let seededCount = 0;

  for (const dept of departments) {
    const deptLocationMap = locationMap.get(dept.slug);
    const deptGroupMap = trainingGroupMap.get(dept.slug);

    if (!deptLocationMap || !deptGroupMap) {
      logger.warning(`Maps not found for department: ${dept.slug}`);
      continue;
    }

    for (const group of dept.trainingGroups) {
      const groupId = deptGroupMap.get(group.name);
      if (!groupId) {
        logger.warning(`Group not found: ${group.name} in ${dept.slug}`);
        continue;
      }

      for (const session of group.sessions) {
        const locationId = deptLocationMap.get(session.locationName);
        if (!locationId) {
          logger.warning(`Location not found: ${session.locationName} in ${dept.slug}`);
          continue;
        }

        const result = await pgClient.query(
          `INSERT INTO "DepartmentTrainingSession" ("trainingGroupId", "locationId", "day", "time", "sort", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [groupId, locationId, session.day, session.time, session.sort],
        );

        if (result.rows.length > 0) {
          seededCount++;
        }
      }
    }
  }

  return seededCount;
}

export async function seedDepartmentsComplete(pgClient: Client): Promise<{
  departments: number;
  stats: number;
  locations: number;
  groups: number;
  sessions: number;
  departmentMap: DepartmentMap;
  locationMap: LocationMap;
}> {
  const spinner = ora('Seeding departments...').start();

  try {
    const departmentMap = await seedDepartments(pgClient);
    const stats = await seedDepartmentStats(pgClient, departmentMap);
    const locationMap = await seedDepartmentLocations(pgClient, departmentMap);
    const trainingGroupMap = await seedDepartmentTrainingGroups(pgClient, departmentMap);
    const sessions = await seedDepartmentTrainingSessions(pgClient, locationMap, trainingGroupMap);

    const locationCount = Array.from(locationMap.values()).reduce(
      (sum, map) => sum + map.size,
      0,
    );
    const groupCount = Array.from(trainingGroupMap.values()).reduce(
      (sum, map) => sum + map.size,
      0,
    );

    spinner.succeed(
      `Seeded departments: ${departmentMap.size} departments, ${stats} stats, ${locationCount} locations, ${groupCount} groups, ${sessions} sessions`,
    );

    return {
      departments: departmentMap.size,
      stats,
      locations: locationCount,
      groups: groupCount,
      sessions,
      departmentMap,
      locationMap,
    };
  } catch (error) {
    spinner.fail('Failed to seed departments');
    throw error;
  }
}

/**
 * Link department icons
 */
export async function linkDepartmentIcons(
  pgClient: Client,
  departmentMap: DepartmentMap,
  mediaMap: MediaFileMap,
): Promise<number> {
  const spinner = ora('Linking department icons...').start();

  try {
    let linkedCount = 0;

    for (const [slug, departmentId] of departmentMap.entries()) {
      // Get the mapped icon filename
      const iconFilenameBase = DEPARTMENT_ICON_MAPPING[slug];
      
      if (iconFilenameBase) {
        const iconFilename = `${iconFilenameBase}.svg`;

        if (mediaMap.has(iconFilename)) {
          const mediaId = mediaMap.get(iconFilename);

          // Update department with icon
          await pgClient.query(
            `UPDATE "Department" SET "iconId" = $1, "updatedAt" = NOW() WHERE id = $2`,
            [mediaId, departmentId],
          );
          linkedCount++;
        }
      }
    }

    spinner.succeed(`Linked ${linkedCount} department icons`);
    return linkedCount;
  } catch (error) {
    spinner.fail('Failed to link department icons');
    throw error;
  }
}

/**
 * Link location images
 */
export async function linkLocationImages(
  pgClient: Client,
  locationMap: LocationMap,
  mediaMap: MediaFileMap,
): Promise<number> {
  const spinner = ora('Linking location images...').start();

  try {
    let linkedCount = 0;

    // Iterate over all locations in the map
    for (const deptLocationMap of locationMap.values()) {
      for (const [locationName, locationId] of deptLocationMap.entries()) {
        // Find matching filename from mapping
        const imageFilenameBase = LOCATION_IMAGE_MAPPING[locationName];

        if (imageFilenameBase) {
          // Look for image with .jpg extension
          const imageFilename = `${imageFilenameBase}.jpg`;

          if (mediaMap.has(imageFilename)) {
            const mediaId = mediaMap.get(imageFilename);

            // Update location with image
            await pgClient.query(
              `UPDATE "DepartmentLocation" SET "imageId" = $1, "updatedAt" = NOW() WHERE id = $2`,
              [mediaId, locationId],
            );
            linkedCount++;
          }
        }
      }
    }

    spinner.succeed(`Linked ${linkedCount} location images`);
    return linkedCount;
  } catch (error) {
    spinner.fail('Failed to link location images');
    throw error;
  }
}
