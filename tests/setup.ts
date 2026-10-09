import { execSync } from 'node:child_process';

import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';

let pgContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

export async function setup(): Promise<void> {
	console.log('\n[e2e] Starting containers...');

	[pgContainer, redisContainer] = await Promise.all([
		new PostgreSqlContainer('postgres:alpine')
			.withDatabase('syncar_test')
			.withUsername('syncar_test')
			.withPassword('syncar_test')
			.start(),
		new RedisContainer('redis:alpine').start(),
	]);

	const databaseUrl = pgContainer.getConnectionUri();

	process.env['DATABASE_URL'] = databaseUrl;
	process.env['PG_USER'] = pgContainer.getUsername();
	process.env['PG_PASSWORD'] = pgContainer.getPassword();
	process.env['PG_HOST'] = pgContainer.getHost();
	process.env['PG_PORT'] = String(pgContainer.getFirstMappedPort());
	process.env['PG_DATABASE'] = pgContainer.getDatabase();
	process.env['REDIS_HOST'] = redisContainer.getHost();
	process.env['REDIS_PORT'] = String(redisContainer.getPort());
	process.env['REDIS_URL'] = redisContainer.getConnectionUrl();
	process.env['NEXTAUTH_SECRET'] = 'syncar-test-secret-with-at-least-32-characters';

	console.log('[e2e] Applying current Prisma schema...');

	execSync('pnpm exec prisma db push --skip-generate', {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: process.env,
	});

	console.log('[e2e] Environment ready.\n');
}

export async function teardown(): Promise<void> {
	await Promise.all([pgContainer?.stop(), redisContainer?.stop()]);
}
