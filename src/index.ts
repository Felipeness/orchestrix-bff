import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

// Middleware
import { authMiddleware } from './middleware/auth';

// Driving Adapters (HTTP Routes)
import { createWorkflowRoutes } from './adapter/driving/http/workflow';
import { createAlertRoutes } from './adapter/driving/http/alert';
import { createAuditRoutes } from './adapter/driving/http/audit';

// Driven Adapters (Infrastructure)
import { OrchetrixApiAdapter } from './adapter/driven/api/orchestrix-api';

// Core Services
import { WorkflowService, AlertService, AuditService } from './core/service';

// Health route (simple, no DI needed)
import { healthRoutes } from './routes/health';

// ============================================================================
// DEPENDENCY INJECTION
// ============================================================================

// Driven Adapters (Secondary/Infrastructure)
const orchestrixApi = new OrchetrixApiAdapter();

// Core Services (Application Layer)
const workflowService = new WorkflowService(orchestrixApi);
const alertService = new AlertService(orchestrixApi);
const auditService = new AuditService(orchestrixApi);

// Driving Adapters (Primary/HTTP Routes)
const workflowRoutes = createWorkflowRoutes(workflowService);
const alertRoutes = createAlertRoutes(alertService);
const auditRoutes = createAuditRoutes(auditService);

// ============================================================================
// APP SETUP
// ============================================================================

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

// ============================================================================
// ROUTES
// ============================================================================

// Health routes (no auth required)
await app.register(healthRoutes);

// API routes (with auth)
await app.register(workflowRoutes, { prefix: '/api/v1' });
await app.register(alertRoutes, { prefix: '/api/v1' });
await app.register(auditRoutes, { prefix: '/api/v1' });

// ============================================================================
// SERVER
// ============================================================================

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
