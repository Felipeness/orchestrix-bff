import { Effect, pipe } from 'effect';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export class ApiError extends Error {
	readonly _tag = 'ApiError' as const;

	constructor(
		public status: number,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
	token?: string;
}

export class ApiClient {
	private baseUrl: string;
	private defaultHeaders: Record<string, string>;

	constructor(baseUrl: string = API_URL) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
		};
	}

	private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
		const { method = 'GET', body, headers = {}, token } = options;

		const requestHeaders: Record<string, string> = {
			...this.defaultHeaders,
			...headers,
		};

		if (token) {
			requestHeaders.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${this.baseUrl}${path}`, {
			method,
			headers: requestHeaders,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const text = await response.text();
			let details: unknown = text;
			try {
				details = JSON.parse(text);
			} catch {
				// Keep as text if not valid JSON
			}
			throw new ApiError(response.status, response.statusText, details);
		}

		if (response.status === 204) {
			return undefined as T;
		}

		return response.json();
	}

	// Effect-based request method
	requestEffect<T>(path: string, options: RequestOptions = {}) {
		return pipe(
			Effect.tryPromise({
				try: () => this.request<T>(path, options),
				catch: (error) => {
					if (error instanceof ApiError) {
						return error;
					}
					return new ApiError(500, 'Request failed', error);
				},
			}),
		);
	}

	// HTTP method shortcuts
	get<T>(path: string, token?: string) {
		return this.request<T>(path, { token });
	}

	post<T>(path: string, body: unknown, token?: string) {
		return this.request<T>(path, { method: 'POST', body, token });
	}

	put<T>(path: string, body: unknown, token?: string) {
		return this.request<T>(path, { method: 'PUT', body, token });
	}

	patch<T>(path: string, body: unknown, token?: string) {
		return this.request<T>(path, { method: 'PATCH', body, token });
	}

	delete<T>(path: string, token?: string) {
		return this.request<T>(path, { method: 'DELETE', token });
	}

	// Effect-based HTTP method shortcuts
	getEffect<T>(path: string, token?: string) {
		return this.requestEffect<T>(path, { token });
	}

	postEffect<T>(path: string, body: unknown, token?: string) {
		return this.requestEffect<T>(path, { method: 'POST', body, token });
	}

	putEffect<T>(path: string, body: unknown, token?: string) {
		return this.requestEffect<T>(path, { method: 'PUT', body, token });
	}

	patchEffect<T>(path: string, body: unknown, token?: string) {
		return this.requestEffect<T>(path, { method: 'PATCH', body, token });
	}

	deleteEffect<T>(path: string, token?: string) {
		return this.requestEffect<T>(path, { method: 'DELETE', token });
	}
}

// Singleton instance
export const apiClient = new ApiClient();
