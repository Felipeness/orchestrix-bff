import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { workflowService } from '../services/workflow';

const CreateWorkflowSchema = z.object({
	name: z.string().min(3).max(100),
	description: z.string().max(500).optional(),
	definition: z.record(z.unknown()),
	schedule: z.string().optional(),
});

const UpdateWorkflowSchema = z.object({
	name: z.string().min(3).max(100).optional(),
	description: z.string().max(500).optional(),
	definition: z.record(z.unknown()).optional(),
	schedule: z.string().optional(),
	status: z.enum(['active', 'inactive', 'draft']).optional(),
});

const ExecuteWorkflowSchema = z.object({
	input: z.record(z.unknown()).optional(),
});

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function workflowRoutes(app: FastifyInstance) {
	// All workflow routes require authentication
	app.addHook('preHandler', requireAuth);

	// List workflows
	app.get('/workflows', async (request: FastifyRequest, reply: FastifyReply) => {
		const query = PaginationSchema.parse(request.query);
		const result = await workflowService.list(request.token!, query.page, query.limit);
		return result;
	});

	// Get workflow by ID
	app.get<{ Params: { id: string } }>('/workflows/:id', async (request, reply) => {
		const workflow = await workflowService.getById(request.params.id, request.token!);
		if (!workflow) {
			return reply.code(404).send({
				error: 'Not Found',
				message: 'Workflow not found',
			});
		}
		return { data: workflow };
	});

	// Create workflow (requires operator or admin role)
	app.post(
		'/workflows',
		{ preHandler: requireRole('operator', 'admin') },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const body = CreateWorkflowSchema.parse(request.body);
			const workflow = await workflowService.create(body, request.token!);
			return reply.code(201).send({ data: workflow });
		},
	);

	// Update workflow (requires operator or admin role)
	app.put<{ Params: { id: string } }>(
		'/workflows/:id',
		{ preHandler: requireRole('operator', 'admin') },
		async (request, reply) => {
			const body = UpdateWorkflowSchema.parse(request.body);
			const workflow = await workflowService.update(request.params.id, body, request.token!);
			return { data: workflow };
		},
	);

	// Delete workflow (requires admin role)
	app.delete<{ Params: { id: string } }>(
		'/workflows/:id',
		{ preHandler: requireRole('admin') },
		async (request, reply) => {
			await workflowService.delete(request.params.id, request.token!);
			return reply.code(204).send();
		},
	);

	// Execute workflow (requires operator or admin role)
	app.post<{ Params: { id: string } }>(
		'/workflows/:id/execute',
		{ preHandler: requireRole('operator', 'admin') },
		async (request, reply) => {
			const body = ExecuteWorkflowSchema.parse(request.body);
			const execution = await workflowService.execute(request.params.id, body, request.token!);
			return reply.code(202).send({ data: execution });
		},
	);

	// List executions for a workflow
	app.get<{ Params: { id: string } }>('/workflows/:id/executions', async (request, reply) => {
		const query = PaginationSchema.parse(request.query);
		const result = await workflowService.listExecutions(
			request.params.id,
			request.token!,
			query.page,
			query.limit,
		);
		return result;
	});

	// Get execution status
	app.get<{ Params: { id: string } }>('/executions/:id', async (request, reply) => {
		const execution = await workflowService.getExecution(request.params.id, request.token!);
		if (!execution) {
			return reply.code(404).send({
				error: 'Not Found',
				message: 'Execution not found',
			});
		}
		return { data: execution };
	});
}
