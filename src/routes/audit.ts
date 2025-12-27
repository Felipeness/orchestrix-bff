import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { auditService } from '../services/audit';

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	event_type: z.string().optional(),
});

export async function auditRoutes(app: FastifyInstance) {
	// All audit routes require authentication and admin role
	app.addHook('preHandler', requireAuth);
	app.addHook('preHandler', requireRole('admin'));

	// List audit logs
	app.get('/audit-logs', async (request: FastifyRequest) => {
		const query = PaginationSchema.parse(request.query);
		const result = await auditService.list(
			request.token!,
			query.page,
			query.limit,
			query.event_type,
		);
		return result;
	});

	// List audit logs by resource
	app.get<{ Params: { type: string; id: string } }>(
		'/audit-logs/resource/:type/:id',
		async (request) => {
			const query = PaginationSchema.parse(request.query);
			const result = await auditService.listByResource(
				request.params.type,
				request.params.id,
				request.token!,
				query.page,
				query.limit,
			);
			return result;
		},
	);

	// List audit logs by user
	app.get<{ Params: { userId: string } }>('/audit-logs/user/:userId', async (request) => {
		const query = PaginationSchema.parse(request.query);
		const result = await auditService.listByUser(
			request.params.userId,
			request.token!,
			query.page,
			query.limit,
		);
		return result;
	});
}
