import 'dotenv/config';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { connectPostgres } from './database';
import {
  seedUsers,
  seedContactPersons,
  seedDepartmentsComplete,
  seedHistory,
  seedHomepage,
  seedBoardContent,
  seedStatutes,
  seedMembershipFee,
  seedSportInsurance,
  seedMembership,
  seedMediaFolders,
  seedMediaFiles,
  linkContactPersonImages,
  linkDepartmentIcons,
  linkLocationImages,
} from './seeders';
import { migrateCategories, migratePosts } from './migrators';
import { Timer } from './utils';

interface MigrationResults {
  users: number;
  contactPersons: number;
  departments: number;
  categories: number;
  posts: number;
  mediaFolders: number;
  mediaFiles: number;
  linkedContactPersonImages: number;
  linkedDepartmentIcons: number;
  linkedLocationImages: number;
}

function printHeader(): void {
  console.log(chalk.blue.bold('═══════════════════════════════════════════'));
  console.log(chalk.blue.bold('  VSG Kugelberg Migration Tool'));
  console.log(chalk.blue.bold('═══════════════════════════════════════════\n'));
}

function printSummary(results: MigrationResults, timer: Timer): void {
  console.log(chalk.blue.bold('\n═══════════════════════════════════════════'));
  console.log(chalk.blue.bold('  Migration Summary'));
  console.log(chalk.blue.bold('═══════════════════════════════════════════\n'));

  const table = new Table({
    head: [chalk.cyan('Operation'), chalk.cyan('Count'), chalk.cyan('Status')],
    colWidths: [25, 12, 15],
  });

  table.push(
    ['Users', results.users.toString(), chalk.green('✓ Complete')],
    ['Media Folders', results.mediaFolders.toString(), chalk.green('✓ Complete')],
    ['Media Files', results.mediaFiles.toString(), chalk.green('✓ Complete')],
    ['Contact Persons', results.contactPersons.toString(), chalk.green('✓ Complete')],
    [
      'Contact Person Images',
      results.linkedContactPersonImages.toString(),
      chalk.green('✓ Linked'),
    ],
    ['Categories', results.categories.toString(), chalk.green('✓ Complete')],
    ['Posts', results.posts.toString(), chalk.green('✓ Complete')],
    ['Departments', results.departments.toString(), chalk.green('✓ Complete')],
    ['Department Icons', results.linkedDepartmentIcons.toString(), chalk.green('✓ Linked')],
    ['Location Images', results.linkedLocationImages.toString(), chalk.green('✓ Linked')],
  );

  console.log(table.toString());
  console.log(chalk.gray(`\nTotal time: ${timer.elapsed()}s\n`));
}

async function main(): Promise<void> {
  const globalTimer = new Timer();
  printHeader();

  let pgClient = null;

  try {
    // Connect to PostgreSQL database
    pgClient = await connectPostgres();

    // Track results
    const results: MigrationResults = {
      users: 0,
      contactPersons: 0,
      departments: 0,
      categories: 0,
      posts: 0,
      mediaFolders: 0,
      mediaFiles: 0,
      linkedContactPersonImages: 0,
      linkedDepartmentIcons: 0,
      linkedLocationImages: 0,
    };

    // 1. Seed users
    results.users = await seedUsers(pgClient);

    // 2. Seed media folders and files
    const folderMap = await seedMediaFolders(pgClient);
    results.mediaFolders = folderMap.size;

    const mediaMap = await seedMediaFiles(pgClient, folderMap);
    results.mediaFiles = mediaMap.size;

    // 3. Seed contact persons and link images
    results.contactPersons = await seedContactPersons(pgClient);
    results.linkedContactPersonImages = await linkContactPersonImages(pgClient, mediaMap);

    // 4. Migrate categories
    const categoryMap = await migrateCategories(pgClient);
    results.categories = categoryMap.size;

    // 5. Migrate posts
    results.posts = await migratePosts(pgClient, categoryMap);

    // 6. Seed departments, then link icons and location images
    const departmentResults = await seedDepartmentsComplete(pgClient);
    results.departments = departmentResults.departments;

    results.linkedDepartmentIcons = await linkDepartmentIcons(
      pgClient,
      departmentResults.departmentMap,
      mediaMap,
    );
    results.linkedLocationImages = await linkLocationImages(
      pgClient,
      departmentResults.locationMap,
      mediaMap,
    );

    // 7. Seed remaining singleton content
    await seedHistory(pgClient);
    await seedHomepage(pgClient, mediaMap);
    await seedBoardContent(pgClient);
    await seedStatutes(pgClient);
    await seedMembershipFee(pgClient);
    await seedSportInsurance(pgClient);
    await seedMembership(pgClient);

    // Print summary
    printSummary(results, globalTimer);
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Migration failed:'), error);
    throw error;
  } finally {
    // Cleanup connection
    if (pgClient) {
      const pgSpinner = ora('Closing PostgreSQL connection...').start();
      await pgClient.end();
      pgSpinner.succeed('Closed PostgreSQL connection');
    }
  }
}

main().catch((error) => {
  console.error(chalk.red.bold('\n✗ Fatal error:'), error);
  process.exit(1);
});
