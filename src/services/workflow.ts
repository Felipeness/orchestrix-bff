import { Effect, pipe } from 'effect';
import { ApiError, apiClient } from '../lib/api-client';

export interface Workflow {
	id: string;
	tenant_id: string;
	name: string;
	description?: string;
	definition: Record<string, unknown>;
	schedule?: string;
	status: 'active' | 'inactive' | 'draft';
	version: number;
	created_by?: string;
	created_at: string;
	updated_at: string;
}

export interface Execution {
	id: string;
	tenant_id: string;
	workflow_id: string;
	temporal_workflow_id?: string;
	temporal_run_id?: string;
	status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
	input?: Record<string, unknown>;
	output?: Record<string, unknown>;
	error?: string;
	started_at?: string;
	completed_at?: string;
	created_by?: string;
	created_at: string;
}

export interface CreateWorkflowInput {
	name: string;
	description?: string;
	definition: Record<string, unknown>;
	schedule?: string;
}

export interface UpdateWorkflowInput {
	name?: string;
	description?: string;
	definition?: Record<string, unknown>;
	schedule?: string;
	status?: 'active' | 'inactive' | 'draft';
}

export interface ExecuteWorkflowInput {
	input?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

export class WorkflowService {
	async list(token: string, page = 1, limit = 20): Promise<PaginatedResponse<Workflow>> {
		try {
			return await apiClient.get<PaginatedResponse<Workflow>>(
				`/api/v1/workflows?page=${page}&limit=${limit}`,
				token,
			);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				throw new Error('Unauthorized - invalid or expired token');
			}
			throw error;
		}
	}

	async getById(id: string, token: string): Promise<Workflow | null> {
		try {
			return await apiClient.get<Workflow>(`/api/v1/workflows/${id}`, token);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.status === 404) return null;
				if (error.status === 401) {
					throw new Error('Unauthorized - invalid or expired token');
				}
			}
			throw error;
		}
	}

	async create(input: CreateWorkflowInput, token: string): Promise<Workflow> {
		return apiClient.post<Workflow>('/api/v1/workflows', input, token);
	}

	async update(id: string, input: UpdateWorkflowInput, token: string): Promise<Workflow> {
		return apiClient.put<Workflow>(`/api/v1/workflows/${id}`, input, token);
	}

	async delete(id: string, token: string): Promise<void> {
		return apiClient.delete(`/api/v1/workflows/${id}`, token);
	}

	async execute(
		workflowId: string,
		input: ExecuteWorkflowInput,
		token: string,
	): Promise<Execution> {
		return apiClient.post<Execution>(`/api/v1/workflows/${workflowId}/execute`, input, token);
	}

	async getExecution(id: string, token: string): Promise<Execution | null> {
		try {
			return await apiClient.get<Execution>(`/api/v1/executions/${id}`, token);
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async listExecutions(
		workflowId: string,
		token: string,
		page = 1,
		limit = 20,
	): Promise<PaginatedResponse<Execution>> {
		return apiClient.get<PaginatedResponse<Execution>>(
			`/api/v1/workflows/${workflowId}/executions?page=${page}&limit=${limit}`,
			token,
		);
	}

	// Effect-TS based methods for composable error handling
	listEffect(token: string, page = 1, limit = 20) {
		return apiClient.getEffect<PaginatedResponse<Workflow>>(
			`/api/v1/workflows?page=${page}&limit=${limit}`,
			token,
		);
	}

	getByIdEffect(id: string, token: string) {
		return pipe(
			apiClient.getEffect<Workflow>(`/api/v1/workflows/${id}`, token),
			Effect.catchTag('ApiError', (error) =>
				error.status === 404 ? Effect.succeed(null) : Effect.fail(error),
			),
		);
	}

	createEffect(input: CreateWorkflowInput, token: string) {
		return apiClient.postEffect<Workflow>('/api/v1/workflows', input, token);
	}

	executeEffect(workflowId: string, input: ExecuteWorkflowInput, token: string) {
		return apiClient.postEffect<Execution>(`/api/v1/workflows/${workflowId}/execute`, input, token);
	}
}

export const workflowService = new WorkflowService();
