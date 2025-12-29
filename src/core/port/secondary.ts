// Secondary Ports - Interfaces that ADAPTERS implement
// These are CALLED by the core services

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

// API Client Port - interface for the Orchestrix API client
export interface OrchetrixApiPort {
	// Workflow operations
	listWorkflows(token: string, page: number, limit: number): Promise<PaginatedResponse<Workflow>>;
	getWorkflow(id: string, token: string): Promise<Workflow | null>;
	createWorkflow(input: CreateWorkflowInput, token: string): Promise<Workflow>;
	updateWorkflow(id: string, input: UpdateWorkflowInput, token: string): Promise<Workflow>;
	deleteWorkflow(id: string, token: string): Promise<void>;
	executeWorkflow(workflowId: string, input: ExecuteWorkflowInput, token: string): Promise<Execution>;
	getExecution(id: string, token: string): Promise<Execution | null>;
	listExecutions(workflowId: string, token: string, page: number, limit: number): Promise<PaginatedResponse<Execution>>;

	// Alert operations
	listAlerts(token: string, page: number, limit: number): Promise<PaginatedResponse<Alert>>;
	getAlert(id: string, token: string): Promise<Alert | null>;
	createAlert(input: CreateAlertInput, token: string): Promise<Alert>;
	acknowledgeAlert(id: string, token: string): Promise<Alert>;
	resolveAlert(id: string, token: string): Promise<Alert>;

	// Audit operations
	listAuditLogs(token: string, page: number, limit: number): Promise<PaginatedResponse<AuditLog>>;
	getAuditLog(id: string, token: string): Promise<AuditLog | null>;
}
