// Primary Ports - Interfaces that the application IMPLEMENTS (services)
// These are CALLED by driving adapters (HTTP handlers)

import type {
	CreateWorkflowInput,
	Execution,
	ExecuteWorkflowInput,
	PaginatedResponse,
	UpdateWorkflowInput,
	Workflow,
} from '../domain/workflow';
import type { Alert, CreateAlertInput } from '../domain/alert';
import type { AuditLog } from '../domain/audit';

// Workflow Service Port
export interface WorkflowServicePort {
	list(token: string, page: number, limit: number): Promise<PaginatedResponse<Workflow>>;
	getById(id: string, token: string): Promise<Workflow | null>;
	create(input: CreateWorkflowInput, token: string): Promise<Workflow>;
	update(id: string, input: UpdateWorkflowInput, token: string): Promise<Workflow>;
	delete(id: string, token: string): Promise<void>;
	execute(workflowId: string, input: ExecuteWorkflowInput, token: string): Promise<Execution>;
	getExecution(id: string, token: string): Promise<Execution | null>;
	listExecutions(workflowId: string, token: string, page: number, limit: number): Promise<PaginatedResponse<Execution>>;
}

// Alert Service Port
export interface AlertServicePort {
	list(token: string, page: number, limit: number): Promise<PaginatedResponse<Alert>>;
	getById(id: string, token: string): Promise<Alert | null>;
	create(input: CreateAlertInput, token: string): Promise<Alert>;
	acknowledge(id: string, token: string): Promise<Alert>;
	resolve(id: string, token: string): Promise<Alert>;
}

// Audit Service Port
export interface AuditServicePort {
	list(token: string, page: number, limit: number): Promise<PaginatedResponse<AuditLog>>;
	getById(id: string, token: string): Promise<AuditLog | null>;
}
