// Audit domain entities

export interface AuditLog {
	id: string;
	tenantId: string;
	userId?: string;
	eventType: string;
	resourceType: string;
	resourceId?: string;
	action: string;
	oldValue?: Record<string, unknown>;
	newValue?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	createdAt: Date;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

// Domain errors
export class AuditLogNotFoundError extends Error {
	constructor(id: string) {
		super(`Audit log ${id} not found`);
		this.name = 'AuditLogNotFoundError';
	}
}
