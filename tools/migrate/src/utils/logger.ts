import chalk from 'chalk';

export const logger = {
  section: (title: string): void => {
    console.log(chalk.blue.bold(`\n=== ${title} ===`));
  },

  success: (message: string): void => {
    console.log(chalk.green(`  ✓ ${message}`));
  },

  warning: (message: string): void => {
    console.log(chalk.yellow(`  ⚠ ${message}`));
  },

  error: (message: string): void => {
    console.log(chalk.red(`  ✗ ${message}`));
  },

  info: (message: string): void => {
    console.log(chalk.gray(`  ${message}`));
  },

  progress: (message: string): void => {
    console.log(chalk.cyan(`  → ${message}`));
  },
};
