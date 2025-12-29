import type {
	CreateWorkflowInput,
	Execution,
	ExecuteWorkflowInput,
	PaginatedResponse,
	UpdateWorkflowInput,
	Workflow,
} from '../domain/workflow';
import type { WorkflowServicePort } from '../port/primary';
import type { OrchetrixApiPort } from '../port/secondary';

export class WorkflowService implements WorkflowServicePort {
	constructor(private readonly api: OrchetrixApiPort) {}

	async list(token: string, page: number, limit: number): Promise<PaginatedResponse<Workflow>> {
		return this.api.listWorkflows(token, page, limit);
	}

	async getById(id: string, token: string): Promise<Workflow | null> {
		return this.api.getWorkflow(id, token);
	}

	async create(input: CreateWorkflowInput, token: string): Promise<Workflow> {
		return this.api.createWorkflow(input, token);
	}

	async update(id: string, input: UpdateWorkflowInput, token: string): Promise<Workflow> {
		return this.api.updateWorkflow(id, input, token);
	}

	async delete(id: string, token: string): Promise<void> {
		return this.api.deleteWorkflow(id, token);
	}

	async execute(workflowId: string, input: ExecuteWorkflowInput, token: string): Promise<Execution> {
		return this.api.executeWorkflow(workflowId, input, token);
	}

	async getExecution(id: string, token: string): Promise<Execution | null> {
		return this.api.getExecution(id, token);
	}

	async listExecutions(
		workflowId: string,
		token: string,
		page: number,
		limit: number,
	): Promise<PaginatedResponse<Execution>> {
		return this.api.listExecutions(workflowId, token, page, limit);
	}
}
