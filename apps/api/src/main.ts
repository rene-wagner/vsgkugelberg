import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function main() {
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

main().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
