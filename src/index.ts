import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { authMiddleware } from './middleware/auth';
import { alertRoutes } from './routes/alert';
import { auditRoutes } from './routes/audit';
import { healthRoutes } from './routes/health';
import { workflowRoutes } from './routes/workflow';

const app = Fastify({
	logger: {
		level: process.env.LOG_LEVEL || 'info',
		transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
	},
});

// Plugins
await app.register(cors, {
	origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	credentials: true,
});

await app.register(helmet, {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
		},
	},
});

await app.register(rateLimit, {
	max: 100,
	timeWindow: '1 minute',
});

// Auth middleware (extracts token from Authorization header)
await app.register(authMiddleware);

// Routes
await app.register(healthRoutes);
await app.register(workflowRoutes, { prefix: '/api/v1' });
await app.register(alertRoutes, { prefix: '/api/v1' });
await app.register(auditRoutes, { prefix: '/api/v1' });

// Start server
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

try {
	await app.listen({ port, host });
	app.log.info(`BFF server running at http://${host}:${port}`);
} catch (err) {
	app.log.error(err);
	process.exit(1);
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'] as const;
for (const signal of signals) {
	process.on(signal, async () => {
		app.log.info(`Received ${signal}, shutting down...`);
		await app.close();
		process.exit(0);
	});
}
