clean:
	find . -type d -name "node_modules" -prune -exec rm -rf '{}' +
	find . -type d -name "dist" -prune -exec rm -rf '{}' +
	find . -type d -name ".turbo" -prune -exec rm -rf '{}' +
	find . -type d -name "coverage" -prune -exec rm -rf '{}' +
	find . -type d -name "generated" -prune -exec rm -rf '{}' +
