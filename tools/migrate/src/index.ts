import 'dotenv/config';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { connectMySQL, connectPostgres } from './database';
import { seedUsers, seedContactPersons, seedDepartmentsComplete, seedHistory } from './seeders';
import { migrateCategories, migratePosts } from './migrators';
import { Timer } from './utils';

interface MigrationResults {
  users: number;
  contactPersons: number;
  departments: number;
  categories: number;
  posts: number;
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
    ['Users', results.users.toString(), chalk.green('✓ Complete')],
    ['Contact Persons', results.contactPersons.toString(), chalk.green('✓ Complete')],
    ['Departments', results.departments.toString(), chalk.green('✓ Complete')],
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
    };

    // Run seeders
    results.users = await seedUsers(pgClient);
    results.contactPersons = await seedContactPersons(pgClient);
    const departmentResults = await seedDepartmentsComplete(pgClient);
    results.departments = departmentResults.departments;
    await seedHistory(pgClient);

    // Run migrators
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
