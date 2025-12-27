import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { alertService } from '../services/alert';

const CreateAlertSchema = z.object({
	workflow_id: z.string().uuid().optional(),
	execution_id: z.string().uuid().optional(),
	severity: z.enum(['info', 'warning', 'critical']).default('info'),
	title: z.string().min(1).max(200),
	message: z.string().max(2000).optional(),
});

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	status: z.enum(['open', 'acknowledged', 'resolved']).optional(),
});

export async function alertRoutes(app: FastifyInstance) {
	app.addHook('preHandler', requireAuth);

	// List alerts
	app.get('/alerts', async (request: FastifyRequest) => {
		const query = PaginationSchema.parse(request.query);
		const result = await alertService.list(request.token!, query.page, query.limit, query.status);
		return result;
	});

	// Get alert by ID
	app.get<{ Params: { id: string } }>('/alerts/:id', async (request, reply) => {
		const alert = await alertService.getById(request.params.id, request.token!);
		if (!alert) {
			return reply.code(404).send({
				error: 'Not Found',
				message: 'Alert not found',
			});
		}
		return { data: alert };
	});

	// Create alert (requires operator or admin role)
	app.post(
		'/alerts',
		{ preHandler: requireRole('operator', 'admin') },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const body = CreateAlertSchema.parse(request.body);
			const alert = await alertService.create(body, request.token!);
			return reply.code(201).send({ data: alert });
		},
	);

	// Acknowledge alert (requires operator or admin role)
	app.post<{ Params: { id: string } }>(
		'/alerts/:id/acknowledge',
		{ preHandler: requireRole('operator', 'admin') },
		async (request) => {
			const alert = await alertService.acknowledge(request.params.id, request.token!);
			return { data: alert };
		},
	);

	// Resolve alert (requires operator or admin role)
	app.post<{ Params: { id: string } }>(
		'/alerts/:id/resolve',
		{ preHandler: requireRole('operator', 'admin') },
		async (request) => {
			const alert = await alertService.resolve(request.params.id, request.token!);
			return { data: alert };
		},
	);
}
