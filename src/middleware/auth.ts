import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyRequest {
		token?: string;
		user?: {
			sub: string;
			email?: string;
			name?: string;
			tenant_id?: string;
			realm_access?: {
				roles: string[];
			};
		};
	}
}

async function authPlugin(fastify: ReturnType<typeof import('fastify').default>) {
	fastify.decorateRequest('token', undefined);
	fastify.decorateRequest('user', undefined);

	fastify.addHook('preHandler', async (request: FastifyRequest) => {
		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return;
		}

		const token = authHeader.substring(7);
		request.token = token;

		// Decode JWT payload (without verification - API will verify)
		try {
			const payloadBase64 = token.split('.')[1];
			const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
			request.user = {
				sub: payload.sub,
				email: payload.email,
				name: payload.name,
				tenant_id: payload.tenant_id,
				realm_access: payload.realm_access,
			};
		} catch {
			// Invalid token format, continue without user
		}
	});
}

export const authMiddleware = fp(authPlugin, {
	name: 'auth-middleware',
});

// Helper to require authentication
export function requireAuth(request: FastifyRequest, reply: FastifyReply, done: () => void) {
	if (!request.token) {
		reply.code(401).send({ error: 'Unauthorized', message: 'Token required' });
		return;
	}
	done();
}

// Helper to require specific roles
export function requireRole(...roles: string[]) {
	return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
		if (!request.token || !request.user) {
			reply.code(401).send({ error: 'Unauthorized', message: 'Token required' });
			return;
		}

		const userRoles = request.user.realm_access?.roles || [];
		const hasRole = roles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			reply.code(403).send({
				error: 'Forbidden',
				message: `Requires one of roles: ${roles.join(', ')}`,
			});
			return;
		}

		done();
	};
}
