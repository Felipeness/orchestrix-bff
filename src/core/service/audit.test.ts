import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AuditService } from './audit';
import type { OrchetrixApiPort } from '../port/secondary';
import type { AuditLog, PaginatedResponse } from '../domain/audit';

const createMockApi = (): OrchetrixApiPort => ({
	listWorkflows: mock(() => Promise.resolve({})),
	getWorkflow: mock(() => Promise.resolve(null)),
	createWorkflow: mock(() => Promise.resolve({})),
	updateWorkflow: mock(() => Promise.resolve({})),
	deleteWorkflow: mock(() => Promise.resolve()),
	executeWorkflow: mock(() => Promise.resolve({})),
	getExecution: mock(() => Promise.resolve(null)),
	listExecutions: mock(() => Promise.resolve({})),
	listAlerts: mock(() => Promise.resolve({})),
	getAlert: mock(() => Promise.resolve(null)),
	createAlert: mock(() => Promise.resolve({})),
	acknowledgeAlert: mock(() => Promise.resolve({})),
	resolveAlert: mock(() => Promise.resolve({})),
	listAuditLogs: mock(() => Promise.resolve({} as PaginatedResponse<AuditLog>)),
	getAuditLog: mock(() => Promise.resolve(null as AuditLog | null)),
});

describe('AuditService', () => {
	let mockApi: OrchetrixApiPort;
	let service: AuditService;

	beforeEach(() => {
		mockApi = createMockApi();
		service = new AuditService(mockApi);
	});

	describe('list', () => {
		it('should return paginated audit logs', async () => {
			const mockResponse: PaginatedResponse<AuditLog> = {
				data: [
					{
						id: '1',
						tenantId: 'tenant-1',
						eventType: 'workflow.created',
						resourceType: 'workflow',
						resourceId: 'wf-1',
						action: 'create',
						createdAt: new Date(),
					},
				],
				total: 1,
				page: 1,
				limit: 20,
			};

			(mockApi.listAuditLogs as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result).toEqual(mockResponse);
			expect(mockApi.listAuditLogs).toHaveBeenCalledWith('token', 1, 20);
		});

		it('should handle empty list', async () => {
			const mockResponse: PaginatedResponse<AuditLog> = {
				data: [],
				total: 0,
				page: 1,
				limit: 20,
			};

			(mockApi.listAuditLogs as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result.data).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	describe('getById', () => {
		it('should return audit log when found', async () => {
			const mockAuditLog: AuditLog = {
				id: '1',
				tenantId: 'tenant-1',
				eventType: 'workflow.updated',
				resourceType: 'workflow',
				resourceId: 'wf-1',
				action: 'update',
				oldValue: { name: 'Old Name' },
				newValue: { name: 'New Name' },
				createdAt: new Date(),
			};

			(mockApi.getAuditLog as ReturnType<typeof mock>).mockResolvedValue(mockAuditLog);

			const result = await service.getById('1', 'token');

			expect(result).toEqual(mockAuditLog);
			expect(mockApi.getAuditLog).toHaveBeenCalledWith('1', 'token');
		});

		it('should return null when not found', async () => {
			(mockApi.getAuditLog as ReturnType<typeof mock>).mockResolvedValue(null);

			const result = await service.getById('not-found', 'token');

			expect(result).toBeNull();
		});
	});
});
