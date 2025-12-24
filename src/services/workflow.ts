import { Effect, pipe } from "effect";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

interface Execution {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  result?: unknown;
}

interface CreateWorkflowInput {
  name: string;
  description?: string;
  params?: Record<string, string>;
}

const API_URL = process.env.API_URL || "http://localhost:8080";

export class WorkflowService {
  async list(): Promise<Workflow[]> {
    // TODO: Call orchestrix-api
    return [
      {
        id: "wf-1",
        name: "Sample Workflow",
        description: "A sample workflow",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getById(id: string): Promise<Workflow | null> {
    // TODO: Call orchestrix-api
    return {
      id,
      name: "Sample Workflow",
      description: "A sample workflow",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async create(input: CreateWorkflowInput): Promise<Workflow> {
    // TODO: Call orchestrix-api
    return {
      id: `wf-${Date.now()}`,
      name: input.name,
      description: input.description,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async execute(
    workflowId: string,
    params?: Record<string, string>
  ): Promise<Execution> {
    // TODO: Call orchestrix-api
    return {
      id: `exec-${Date.now()}`,
      workflowId,
      status: "pending",
      startedAt: new Date(),
    };
  }

  async getExecution(id: string): Promise<Execution | null> {
    // TODO: Call orchestrix-api
    return {
      id,
      workflowId: "wf-1",
      status: "completed",
      startedAt: new Date(Date.now() - 5000),
      completedAt: new Date(),
      result: { success: true },
    };
  }

  // Effect-TS example for future use
  listWithEffect() {
    return pipe(
      Effect.tryPromise({
        try: () => fetch(`${API_URL}/api/v1/workflows`).then((r) => r.json()),
        catch: (error) => new Error(`Failed to fetch workflows: ${error}`),
      }),
      Effect.map((response) => response.data as Workflow[])
    );
  }
}
