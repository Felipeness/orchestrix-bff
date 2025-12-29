import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AlertService } from './alert';
import type { OrchetrixApiPort } from '../port/secondary';
import type { Alert, PaginatedResponse, CreateAlertInput } from '../domain/alert';

const createMockApi = (): OrchetrixApiPort => ({
	listWorkflows: mock(() => Promise.resolve({})),
	getWorkflow: mock(() => Promise.resolve(null)),
	createWorkflow: mock(() => Promise.resolve({})),
	updateWorkflow: mock(() => Promise.resolve({})),
	deleteWorkflow: mock(() => Promise.resolve()),
	executeWorkflow: mock(() => Promise.resolve({})),
	getExecution: mock(() => Promise.resolve(null)),
	listExecutions: mock(() => Promise.resolve({})),
	listAlerts: mock(() => Promise.resolve({} as PaginatedResponse<Alert>)),
	getAlert: mock(() => Promise.resolve(null as Alert | null)),
	createAlert: mock(() => Promise.resolve({} as Alert)),
	acknowledgeAlert: mock(() => Promise.resolve({} as Alert)),
	resolveAlert: mock(() => Promise.resolve({} as Alert)),
	listAuditLogs: mock(() => Promise.resolve({})),
	getAuditLog: mock(() => Promise.resolve(null)),
});

describe('AlertService', () => {
	let mockApi: OrchetrixApiPort;
	let service: AlertService;

	beforeEach(() => {
		mockApi = createMockApi();
		service = new AlertService(mockApi);
	});

	describe('list', () => {
		it('should return paginated alerts', async () => {
			const mockResponse: PaginatedResponse<Alert> = {
				data: [
					{
						id: '1',
						tenantId: 'tenant-1',
						title: 'Test Alert',
						severity: 'warning',
						status: 'open',
						createdAt: new Date(),
					},
				],
				total: 1,
				page: 1,
				limit: 20,
			};

			(mockApi.listAlerts as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result).toEqual(mockResponse);
			expect(mockApi.listAlerts).toHaveBeenCalledWith('token', 1, 20);
		});

		it('should handle empty list', async () => {
			const mockResponse: PaginatedResponse<Alert> = {
				data: [],
				total: 0,
				page: 1,
				limit: 20,
			};

			(mockApi.listAlerts as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

			const result = await service.list('token', 1, 20);

			expect(result.data).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	describe('getById', () => {
		it('should return alert when found', async () => {
			const mockAlert: Alert = {
				id: '1',
				tenantId: 'tenant-1',
				title: 'Test Alert',
				severity: 'critical',
				status: 'open',
				createdAt: new Date(),
			};

			(mockApi.getAlert as ReturnType<typeof mock>).mockResolvedValue(mockAlert);

			const result = await service.getById('1', 'token');

			expect(result).toEqual(mockAlert);
			expect(mockApi.getAlert).toHaveBeenCalledWith('1', 'token');
		});

		it('should return null when not found', async () => {
			(mockApi.getAlert as ReturnType<typeof mock>).mockResolvedValue(null);

			const result = await service.getById('not-found', 'token');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create alert successfully', async () => {
			const input: CreateAlertInput = {
				title: 'New Alert',
				severity: 'warning',
			};

			const mockAlert: Alert = {
				id: '1',
				tenantId: 'tenant-1',
				title: 'New Alert',
				severity: 'warning',
				status: 'open',
				createdAt: new Date(),
			};

			(mockApi.createAlert as ReturnType<typeof mock>).mockResolvedValue(mockAlert);

			const result = await service.create(input, 'token');

			expect(result).toEqual(mockAlert);
			expect(mockApi.createAlert).toHaveBeenCalledWith(input, 'token');
		});
	});

	describe('acknowledge', () => {
		it('should acknowledge alert successfully', async () => {
			const mockAlert: Alert = {
				id: '1',
				tenantId: 'tenant-1',
				title: 'Test Alert',
				severity: 'warning',
				status: 'acknowledged',
				acknowledgedAt: new Date(),
				createdAt: new Date(),
			};

			(mockApi.acknowledgeAlert as ReturnType<typeof mock>).mockResolvedValue(mockAlert);

			const result = await service.acknowledge('1', 'token');

			expect(result.status).toBe('acknowledged');
			expect(mockApi.acknowledgeAlert).toHaveBeenCalledWith('1', 'token');
		});
	});

	describe('resolve', () => {
		it('should resolve alert successfully', async () => {
			const mockAlert: Alert = {
				id: '1',
				tenantId: 'tenant-1',
				title: 'Test Alert',
				severity: 'warning',
				status: 'resolved',
				resolvedAt: new Date(),
				createdAt: new Date(),
			};

			(mockApi.resolveAlert as ReturnType<typeof mock>).mockResolvedValue(mockAlert);

			const result = await service.resolve('1', 'token');

			expect(result.status).toBe('resolved');
			expect(mockApi.resolveAlert).toHaveBeenCalledWith('1', 'token');
		});
	});
});
