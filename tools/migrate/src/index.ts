import 'dotenv/config';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { connectMySQL, connectPostgres } from './database';
import {
  seedUsers,
  seedContactPersons,
  seedDepartmentsComplete,
  seedHistory,
  seedHomepage,
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
  console.log(chalk.blue.bold('  MySQL → PostgreSQL Migration Tool'));
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
    ['Media Folders', results.mediaFolders.toString(), chalk.green('✓ Complete')],
    ['Media Files', results.mediaFiles.toString(), chalk.green('✓ Complete')],
    ['Users', results.users.toString(), chalk.green('✓ Complete')],
    ['Contact Persons', results.contactPersons.toString(), chalk.green('✓ Complete')],
    [
      'Contact Person Images',
      results.linkedContactPersonImages.toString(),
      chalk.green('✓ Linked'),
    ],
    ['Departments', results.departments.toString(), chalk.green('✓ Complete')],
    ['Department Icons', results.linkedDepartmentIcons.toString(), chalk.green('✓ Linked')],
    ['Location Images', results.linkedLocationImages.toString(), chalk.green('✓ Linked')],
    ['Categories', results.categories.toString(), chalk.green('✓ Complete')],
    ['Posts', results.posts.toString(), chalk.green('✓ Complete')],
  );

  console.log(table.toString());
  console.log(chalk.gray(`\nTotal time: ${timer.elapsed()}s\n`));
}

async function main(): Promise<void> {
  const globalTimer = new Timer();
  printHeader();

  let mysqlConn = null;
  let pgClient = null;

  try {
    // Connect to databases
    mysqlConn = await connectMySQL();
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

    // 1. Seed media folders and files (BEFORE other seeders)
    const folderMap = await seedMediaFolders(pgClient);
    results.mediaFolders = folderMap.size;

    const mediaMap = await seedMediaFiles(pgClient, folderMap);
    results.mediaFiles = mediaMap.size;

    // 2. Seed users
    results.users = await seedUsers(pgClient);

    // 3. Seed contact persons
    results.contactPersons = await seedContactPersons(pgClient);

    // 4. Link contact person images
    results.linkedContactPersonImages = await linkContactPersonImages(pgClient, mediaMap);

    // 5. Seed departments
    const departmentResults = await seedDepartmentsComplete(pgClient);
    results.departments = departmentResults.departments;

    // 6. Link department icons and location images
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

    // 7. Seed history
    await seedHistory(pgClient);

    // 8. Seed homepage
    await seedHomepage(pgClient, mediaMap);

    // 9. Run migrators (categories and posts)
    const categoryMap = await migrateCategories(mysqlConn, pgClient);
    results.categories = categoryMap.size;
    results.posts = await migratePosts(mysqlConn, pgClient, categoryMap);

    // Print summary
    printSummary(results, globalTimer);
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Migration failed:'), error);
    throw error;
  } finally {
    // Cleanup connections
    if (pgClient) {
      const pgSpinner = ora('Closing PostgreSQL connection...').start();
      await pgClient.end();
      pgSpinner.succeed('Closed PostgreSQL connection');
    }
    if (mysqlConn) {
      const mysqlSpinner = ora('Closing MySQL connection...').start();
      await mysqlConn.end();
      mysqlSpinner.succeed('Closed MySQL connection');
    }
  }
}

main().catch((error) => {
  console.error(chalk.red.bold('\n✗ Fatal error:'), error);
  process.exit(1);
});
