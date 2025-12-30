clean:
	find . -type d -name "node_modules" -prune -exec rm -rf '{}' +
	find . -type d -name "dist" -prune -exec rm -rf '{}' +
	find . -type d -name ".turbo" -prune -exec rm -rf '{}' +
	find . -type d -name "coverage" -prune -exec rm -rf '{}' +
	find . -type d -name "generated" -prune -exec rm -rf '{}' +
	rm ./apps/api/uploads/*.{jpg,jpeg,png,webp,svg}

clean-migrations:
	rm -rvf apps/api/prisma/migrations
	pnpm --filter api exec prisma migrate reset
	pnpm --filter api exec prisma migrate dev --name init

setup:
	pnpm install
	pnpm --filter api prisma:generate
	pnpm --filter api prisma:migrate
