import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { WorkflowService } from './workflow';
import type { OrchetrixApiPort } from '../port/secondary';
import type { Workflow, Execution, PaginatedResponse } from '../domain/workflow';

// Create mock functions that return the mock API
const createMockApi = (): OrchetrixApiPort => ({
	listWorkflows: mock(() => Promise.resolve({} as PaginatedResponse<Workflow>)),
	getWorkflow: mock(() => Promise.resolve(null as Workflow | null)),
	createWorkflow: mock(() => Promise.resolve({} as Workflow)),
	updateWorkflow: mock(() => Promise.resolve({} as Workflow)),
	deleteWorkflow: mock(() => Promise.resolve()),
	executeWorkflow: mock(() => Promise.resolve({} as Execution)),
	getExecution: mock(() => Promise.resolve(null as Execution | null)),
	listExecutions: mock(() => Promise.resolve({} as PaginatedResponse<Execution>)),
	listAlerts: mock(() => Promise.resolve({})),
	getAlert: mock(() => Promise.resolve(null)),
	createAlert: mock(() => Promise.resolve({})),
	acknowledgeAlert: mock(() => Promise.resolve({})),
	resolveAlert: mock(() => Promise.resolve({})),
	listAuditLogs: mock(() => Promise.resolve({})),
	getAuditLog: mock(() => Promise.resolve(null)),
});

describe('WorkflowService', () => {
	let mockApi: OrchetrixApiPort;
	let service: WorkflowService;

	beforeEach(() => {
		mockApi = createMockApi();
		service = new WorkflowService(mockApi);
	});

	describe('list', () => {
		it('should return paginated workflows', async () => {
			const mockResponse: PaginatedResponse<Workflow> = {
				data: [
					{
						id: '1',
						tenantId: 'tenant-1',
						name: 'Test Workflow',
						status: 'active',
						version: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				],
				total: 1,
				page: 1,
				limit: 20,
			};

			(mockApi.listWorkflows as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result).toEqual(mockResponse);
			expect(mockApi.listWorkflows).toHaveBeenCalledWith('token', 1, 20);
		});

		it('should handle empty list', async () => {
			const mockResponse: PaginatedResponse<Workflow> = {
				data: [],
				total: 0,
				page: 1,
				limit: 20,
			};

			(mockApi.listWorkflows as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result.data).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	describe('getById', () => {
		it('should return workflow when found', async () => {
			const mockWorkflow: Workflow = {
				id: '1',
				tenantId: 'tenant-1',
				name: 'Test Workflow',
				status: 'active',
				version: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			(mockApi.getWorkflow as ReturnType<typeof mock>).mockResolvedValue(mockWorkflow);

			const result = await service.getById('1', 'token');

			expect(result).toEqual(mockWorkflow);
			expect(mockApi.getWorkflow).toHaveBeenCalledWith('1', 'token');
		});

		it('should return null when not found', async () => {
			(mockApi.getWorkflow as ReturnType<typeof mock>).mockResolvedValue(null);

			const result = await service.getById('not-found', 'token');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create workflow successfully', async () => {
			const input = {
				name: 'New Workflow',
				definition: { steps: [] },
			};

			const mockWorkflow: Workflow = {
				id: '1',
				tenantId: 'tenant-1',
				name: 'New Workflow',
				status: 'draft',
				version: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			(mockApi.createWorkflow as ReturnType<typeof mock>).mockResolvedValue(mockWorkflow);

			const result = await service.create(input, 'token');

			expect(result).toEqual(mockWorkflow);
			expect(mockApi.createWorkflow).toHaveBeenCalledWith(input, 'token');
		});
	});

	describe('update', () => {
		it('should update workflow successfully', async () => {
			const input = { name: 'Updated Workflow' };

			const mockWorkflow: Workflow = {
				id: '1',
				tenantId: 'tenant-1',
				name: 'Updated Workflow',
				status: 'active',
				version: 2,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			(mockApi.updateWorkflow as ReturnType<typeof mock>).mockResolvedValue(mockWorkflow);

			const result = await service.update('1', input, 'token');

			expect(result.name).toBe('Updated Workflow');
			expect(mockApi.updateWorkflow).toHaveBeenCalledWith('1', input, 'token');
		});
	});

	describe('delete', () => {
		it('should delete workflow successfully', async () => {
			(mockApi.deleteWorkflow as ReturnType<typeof mock>).mockResolvedValue(undefined);

			await service.delete('1', 'token');

			expect(mockApi.deleteWorkflow).toHaveBeenCalledWith('1', 'token');
		});
	});

	describe('execute', () => {
		it('should execute workflow successfully', async () => {
			const input = { input: { key: 'value' } };

			const mockExecution: Execution = {
				id: 'exec-1',
				workflowId: '1',
				tenantId: 'tenant-1',
				status: 'running',
				createdAt: new Date().toISOString(),
			};

			(mockApi.executeWorkflow as ReturnType<typeof mock>).mockResolvedValue(mockExecution);

			const result = await service.execute('1', input, 'token');

			expect(result.status).toBe('running');
			expect(mockApi.executeWorkflow).toHaveBeenCalledWith('1', input, 'token');
		});
	});

	describe('getExecution', () => {
		it('should return execution when found', async () => {
			const mockExecution: Execution = {
				id: 'exec-1',
				workflowId: '1',
				tenantId: 'tenant-1',
				status: 'completed',
				createdAt: new Date().toISOString(),
			};

			(mockApi.getExecution as ReturnType<typeof mock>).mockResolvedValue(mockExecution);

			const result = await service.getExecution('exec-1', 'token');

			expect(result).toEqual(mockExecution);
		});

		it('should return null when not found', async () => {
			(mockApi.getExecution as ReturnType<typeof mock>).mockResolvedValue(null);

			const result = await service.getExecution('not-found', 'token');

			expect(result).toBeNull();
		});
	});

	describe('listExecutions', () => {
		it('should return paginated executions', async () => {
			const mockResponse: PaginatedResponse<Execution> = {
				data: [
					{
						id: 'exec-1',
						workflowId: '1',
						tenantId: 'tenant-1',
						status: 'completed',
						createdAt: new Date().toISOString(),
					},
				],
				total: 1,
				page: 1,
				limit: 20,
			};

			(mockApi.listExecutions as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.listExecutions('1', 'token', 1, 20);

			expect(result).toEqual(mockResponse);
			expect(mockApi.listExecutions).toHaveBeenCalledWith('1', 'token', 1, 20);
		});
	});
});
