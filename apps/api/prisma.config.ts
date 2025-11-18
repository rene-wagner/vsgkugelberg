import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://user:secret@localhost:5432/mydb?schema=public';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
