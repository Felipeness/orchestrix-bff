// Domain entities - pure types without infrastructure dependencies

export interface Workflow {
	id: string;
	tenantId: string;
	name: string;
	description?: string;
	definition: Record<string, unknown>;
	schedule?: string;
	status: WorkflowStatus;
	version: number;
	createdBy?: string;
	createdAt: Date;
	updatedAt: Date;
}

export type WorkflowStatus = 'active' | 'inactive' | 'draft';

export interface Execution {
	id: string;
	tenantId: string;
	workflowId: string;
	temporalWorkflowId?: string;
	temporalRunId?: string;
	status: ExecutionStatus;
	input?: Record<string, unknown>;
	output?: Record<string, unknown>;
	error?: string;
	startedAt?: Date;
	completedAt?: Date;
	createdBy?: string;
	createdAt: Date;
	triggeredBy?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// DTOs for creating/updating
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
	status?: WorkflowStatus;
}

export interface ExecuteWorkflowInput {
	input?: Record<string, unknown>;
}

// Paginated response
export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

// Domain errors
export class WorkflowNotFoundError extends Error {
	constructor(id: string) {
		super(`Workflow ${id} not found`);
		this.name = 'WorkflowNotFoundError';
	}
}

export class ExecutionNotFoundError extends Error {
	constructor(id: string) {
		super(`Execution ${id} not found`);
		this.name = 'ExecutionNotFoundError';
	}
}

export class UnauthorizedError extends Error {
	constructor(message = 'Unauthorized') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}
