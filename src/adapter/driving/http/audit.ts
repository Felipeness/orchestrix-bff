import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { AuditServicePort } from '../../../core/port/primary';
import { requireAuth } from '../../../middleware/auth';

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function createAuditRoutes(auditService: AuditServicePort) {
	return async function auditRoutes(app: FastifyInstance) {
		// All audit routes require authentication
		app.addHook('preHandler', requireAuth);

		// List audit logs
		app.get('/audit-logs', async (request: FastifyRequest) => {
			const query = PaginationSchema.parse(request.query);
			return auditService.list(request.token!, query.page, query.limit);
		});

		// Get audit log by ID
		app.get<{ Params: { id: string } }>('/audit-logs/:id', async (request, reply) => {
			const auditLog = await auditService.getById(request.params.id, request.token!);
			if (!auditLog) {
				return reply.code(404).send({
					error: 'Not Found',
					message: 'Audit log not found',
				});
			}
			return { data: auditLog };
		});
	};
}
