import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { WorkflowService } from "../services/workflow";

const CreateWorkflowSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  params: z.record(z.string()).optional(),
});

const ExecuteWorkflowSchema = z.object({
  params: z.record(z.string()).optional(),
});

export async function workflowRoutes(app: FastifyInstance) {
  const workflowService = new WorkflowService();

  // List workflows
  app.get("/workflows", async (request, reply) => {
    const workflows = await workflowService.list();
    return { data: workflows };
  });

  // Get workflow by ID
  app.get<{ Params: { id: string } }>("/workflows/:id", async (request) => {
    const workflow = await workflowService.getById(request.params.id);
    if (!workflow) {
      throw { statusCode: 404, message: "Workflow not found" };
    }
    return { data: workflow };
  });

  // Create workflow
  app.post("/workflows", async (request, reply) => {
    const body = CreateWorkflowSchema.parse(request.body);
    const workflow = await workflowService.create(body);
    reply.status(201);
    return { data: workflow };
  });

  // Execute workflow
  app.post<{ Params: { id: string } }>(
    "/workflows/:id/execute",
    async (request, reply) => {
      const body = ExecuteWorkflowSchema.parse(request.body);
      const execution = await workflowService.execute(
        request.params.id,
        body.params
      );
      reply.status(202);
      return { data: execution };
    }
  );

  // Get execution status
  app.get<{ Params: { id: string } }>(
    "/executions/:id",
    async (request) => {
      const execution = await workflowService.getExecution(request.params.id);
      if (!execution) {
        throw { statusCode: 404, message: "Execution not found" };
      }
      return { data: execution };
    }
  );
}
