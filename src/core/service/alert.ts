import type { Alert, CreateAlertInput, PaginatedResponse } from '../domain/alert';
import type { AlertServicePort } from '../port/primary';
import type { OrchetrixApiPort } from '../port/secondary';

export class AlertService implements AlertServicePort {
	constructor(private readonly api: OrchetrixApiPort) {}

	async list(token: string, page: number, limit: number): Promise<PaginatedResponse<Alert>> {
		return this.api.listAlerts(token, page, limit);
	}

	async getById(id: string, token: string): Promise<Alert | null> {
		return this.api.getAlert(id, token);
	}

	async create(input: CreateAlertInput, token: string): Promise<Alert> {
		return this.api.createAlert(input, token);
	}

	async acknowledge(id: string, token: string): Promise<Alert> {
		return this.api.acknowledgeAlert(id, token);
	}

	async resolve(id: string, token: string): Promise<Alert> {
		return this.api.resolveAlert(id, token);
	}
}
