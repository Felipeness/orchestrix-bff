import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
	app.get('/health', async () => {
		return { status: 'healthy' };
	});

	app.get('/health/live', async () => {
		return { status: 'alive' };
	});

	app.get('/health/ready', async () => {
		// TODO: Check dependencies (Redis, API, etc.)
		return { status: 'ready' };
	});
}
