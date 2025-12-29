// Alert domain entities

export interface Alert {
	id: string;
	tenantId: string;
	workflowId?: string;
	executionId?: string;
	severity: AlertSeverity;
	title: string;
	message?: string;
	status: AlertStatus;
	acknowledgedAt?: Date;
	acknowledgedBy?: string;
	resolvedAt?: Date;
	resolvedBy?: string;
	createdAt: Date;
	triggeredByRuleId?: string;
	source?: string;
	metadata?: Record<string, unknown>;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface CreateAlertInput {
	workflowId?: string;
	executionId?: string;
	severity: AlertSeverity;
	title: string;
	message?: string;
	source?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

// Domain errors
export class AlertNotFoundError extends Error {
	constructor(id: string) {
		super(`Alert ${id} not found`);
		this.name = 'AlertNotFoundError';
	}
}

export class AlertAlreadyAcknowledgedError extends Error {
	constructor(id: string) {
		super(`Alert ${id} is already acknowledged`);
		this.name = 'AlertAlreadyAcknowledgedError';
	}
}

export class AlertAlreadyResolvedError extends Error {
	constructor(id: string) {
		super(`Alert ${id} is already resolved`);
		this.name = 'AlertAlreadyResolvedError';
	}
}
