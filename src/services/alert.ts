import { apiClient } from '../lib/api-client';

export interface Alert {
	id: string;
	tenant_id: string;
	workflow_id: string | null;
	execution_id: string | null;
	severity: string;
	title: string;
	message: string | null;
	status: string;
	acknowledged_at: string | null;
	acknowledged_by: string | null;
	resolved_at: string | null;
	resolved_by: string | null;
	created_at: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

export interface CreateAlertInput {
	workflow_id?: string;
	execution_id?: string;
	severity: string;
	title: string;
	message?: string;
}

class AlertService {
	async list(
		token: string,
		page = 1,
		limit = 20,
		status?: string,
	): Promise<PaginatedResponse<Alert>> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (status) {
			params.append('status', status);
		}

		const response = await apiClient.get<PaginatedResponse<Alert>>(
			`/alerts?${params.toString()}`,
			token,
		);
		return response;
	}

	async getById(id: string, token: string): Promise<Alert | null> {
		try {
			const response = await apiClient.get<{ data: Alert }>(`/alerts/${id}`, token);
			return response.data;
		} catch {
			return null;
		}
	}

	async create(input: CreateAlertInput, token: string): Promise<Alert> {
		const response = await apiClient.post<{ data: Alert }>('/alerts', input, token);
		return response.data;
	}

	async acknowledge(id: string, token: string): Promise<Alert> {
		const response = await apiClient.post<{ data: Alert }>(`/alerts/${id}/acknowledge`, {}, token);
		return response.data;
	}

	async resolve(id: string, token: string): Promise<Alert> {
		const response = await apiClient.post<{ data: Alert }>(`/alerts/${id}/resolve`, {}, token);
		return response.data;
	}
}

export const alertService = new AlertService();
