import { apiClient } from '../lib/api-client';

export interface AuditLog {
	id: string;
	tenant_id: string;
	user_id: string | null;
	event_type: string;
	resource_type: string;
	resource_id: string | null;
	action: string;
	old_value: Record<string, unknown> | null;
	new_value: Record<string, unknown> | null;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

class AuditService {
	async list(
		token: string,
		page = 1,
		limit = 20,
		eventType?: string,
	): Promise<PaginatedResponse<AuditLog>> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (eventType) {
			params.append('event_type', eventType);
		}

		const response = await apiClient.get<PaginatedResponse<AuditLog>>(
			`/audit-logs?${params.toString()}`,
			token,
		);
		return response;
	}

	async listByResource(
		resourceType: string,
		resourceId: string,
		token: string,
		page = 1,
		limit = 20,
	): Promise<PaginatedResponse<AuditLog>> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		const response = await apiClient.get<PaginatedResponse<AuditLog>>(
			`/audit-logs/resource/${resourceType}/${resourceId}?${params.toString()}`,
			token,
		);
		return response;
	}

	async listByUser(
		userId: string,
		token: string,
		page = 1,
		limit = 20,
	): Promise<PaginatedResponse<AuditLog>> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		const response = await apiClient.get<PaginatedResponse<AuditLog>>(
			`/audit-logs/user/${userId}?${params.toString()}`,
			token,
		);
		return response;
	}
}

export const auditService = new AuditService();
