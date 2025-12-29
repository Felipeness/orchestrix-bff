import type { AuditLog, PaginatedResponse } from '../domain/audit';
import type { AuditServicePort } from '../port/primary';
import type { OrchetrixApiPort } from '../port/secondary';

export class AuditService implements AuditServicePort {
	constructor(private readonly api: OrchetrixApiPort) {}

	async list(token: string, page: number, limit: number): Promise<PaginatedResponse<AuditLog>> {
		return this.api.listAuditLogs(token, page, limit);
	}

	async getById(id: string, token: string): Promise<AuditLog | null> {
		return this.api.getAuditLog(id, token);
	}
}
