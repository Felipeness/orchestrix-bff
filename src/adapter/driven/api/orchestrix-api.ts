import type { OrchetrixApiPort } from '../../../core/port/secondary';
import type {
	CreateWorkflowInput,
	Execution,
	ExecuteWorkflowInput,
	PaginatedResponse,
	UpdateWorkflowInput,
	Workflow,
} from '../../../core/domain/workflow';
import type { Alert, CreateAlertInput } from '../../../core/domain/alert';
import type { AuditLog } from '../../../core/domain/audit';

export class ApiError extends Error {
	readonly _tag = 'ApiError' as const;

	constructor(
		public status: number,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class OrchetrixApiAdapter implements OrchetrixApiPort {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || process.env.API_URL || 'http://localhost:8080';
	}

	private async request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				...options.headers,
			},
		});

		if (!response.ok) {
			const text = await response.text();
			let details: unknown = text;
			try {
				details = JSON.parse(text);
			} catch {
				// Keep as text if not valid JSON
			}
			throw new ApiError(response.status, response.statusText, details);
		}

		if (response.status === 204) {
			return undefined as T;
		}

		return response.json();
	}

	// ==================== Workflow Operations ====================

	async listWorkflows(token: string, page: number, limit: number): Promise<PaginatedResponse<Workflow>> {
		return this.request<PaginatedResponse<Workflow>>(
			`/api/v1/workflows?page=${page}&limit=${limit}`,
			token,
		);
	}

	async getWorkflow(id: string, token: string): Promise<Workflow | null> {
		try {
			const response = await this.request<{ data: Workflow }>(`/api/v1/workflows/${id}`, token);
			return response.data;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async createWorkflow(input: CreateWorkflowInput, token: string): Promise<Workflow> {
		const response = await this.request<{ data: Workflow }>('/api/v1/workflows', token, {
			method: 'POST',
			body: JSON.stringify(input),
		});
		return response.data;
	}

	async updateWorkflow(id: string, input: UpdateWorkflowInput, token: string): Promise<Workflow> {
		const response = await this.request<{ data: Workflow }>(`/api/v1/workflows/${id}`, token, {
			method: 'PUT',
			body: JSON.stringify(input),
		});
		return response.data;
	}

	async deleteWorkflow(id: string, token: string): Promise<void> {
		await this.request<void>(`/api/v1/workflows/${id}`, token, { method: 'DELETE' });
	}

	async executeWorkflow(
		workflowId: string,
		input: ExecuteWorkflowInput,
		token: string,
	): Promise<Execution> {
		const response = await this.request<{ data: Execution }>(
			`/api/v1/workflows/${workflowId}/execute`,
			token,
			{
				method: 'POST',
				body: JSON.stringify(input),
			},
		);
		return response.data;
	}

	async getExecution(id: string, token: string): Promise<Execution | null> {
		try {
			const response = await this.request<{ data: Execution }>(`/api/v1/executions/${id}`, token);
			return response.data;
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
		page: number,
		limit: number,
	): Promise<PaginatedResponse<Execution>> {
		return this.request<PaginatedResponse<Execution>>(
			`/api/v1/workflows/${workflowId}/executions?page=${page}&limit=${limit}`,
			token,
		);
	}

	// ==================== Alert Operations ====================

	async listAlerts(token: string, page: number, limit: number): Promise<PaginatedResponse<Alert>> {
		return this.request<PaginatedResponse<Alert>>(`/api/v1/alerts?page=${page}&limit=${limit}`, token);
	}

	async getAlert(id: string, token: string): Promise<Alert | null> {
		try {
			const response = await this.request<{ data: Alert }>(`/api/v1/alerts/${id}`, token);
			return response.data;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async createAlert(input: CreateAlertInput, token: string): Promise<Alert> {
		const response = await this.request<{ data: Alert }>('/api/v1/alerts', token, {
			method: 'POST',
			body: JSON.stringify(input),
		});
		return response.data;
	}

	async acknowledgeAlert(id: string, token: string): Promise<Alert> {
		const response = await this.request<{ data: Alert }>(`/api/v1/alerts/${id}/acknowledge`, token, {
			method: 'POST',
		});
		return response.data;
	}

	async resolveAlert(id: string, token: string): Promise<Alert> {
		const response = await this.request<{ data: Alert }>(`/api/v1/alerts/${id}/resolve`, token, {
			method: 'POST',
		});
		return response.data;
	}

	// ==================== Audit Operations ====================

	async listAuditLogs(token: string, page: number, limit: number): Promise<PaginatedResponse<AuditLog>> {
		return this.request<PaginatedResponse<AuditLog>>(
			`/api/v1/audit-logs?page=${page}&limit=${limit}`,
			token,
		);
	}

	async getAuditLog(id: string, token: string): Promise<AuditLog | null> {
		try {
			const response = await this.request<{ data: AuditLog }>(`/api/v1/audit-logs/${id}`, token);
			return response.data;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				return null;
			}
			throw error;
		}
	}
}
