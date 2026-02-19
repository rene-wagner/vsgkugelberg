clean:
	find . -type d -name "node_modules" -prune -exec rm -rf '{}' +
	find . -type d -name "dist" -prune -exec rm -rf '{}' +
	find . -type d -name ".turbo" -prune -exec rm -rf '{}' +
	find . -type d -name "coverage" -prune -exec rm -rf '{}' +
	find . -type d -name "generated" -prune -exec rm -rf '{}' +
	find ./apps/api/uploads -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" \) -delete 2>/dev/null || true

clean-migrations:
	rm -rvf apps/api/prisma/migrations
	pnpm --filter api prisma:generate
	pnpm --filter api exec prisma migrate reset
	pnpm --filter api exec prisma migrate dev --name init
	DATABASE_URL="postgresql://user:secret@localhost:5432/database_test?schema=public" pnpm --filter api exec prisma migrate reset
	DATABASE_URL="postgresql://user:secret@localhost:5432/database_test?schema=public" pnpm --filter api prisma:migrate
	pnpm --filter migrate migrate
