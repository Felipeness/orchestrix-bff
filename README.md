# Orchestrix BFF

Backend for Frontend service for the Orchestrix platform.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Fastify
- **FP Library**: Effect-TS
- **ORM**: Drizzle
- **Validation**: Zod
- **Cache**: Redis (ioredis)

## Project Structure

```
orchestrix-bff/
├── src/
│   ├── routes/        # Fastify route handlers
│   ├── services/      # Business logic & API calls
│   ├── middleware/    # Auth, rate-limit, etc.
│   ├── schemas/       # Zod validation schemas
│   ├── lib/           # Utilities
│   └── index.ts       # Entry point
└── drizzle/
    ├── schema.ts      # Database schema
    └── migrations/    # SQL migrations
```

## Getting Started

### Prerequisites

- Bun 1.0+
- PostgreSQL (optional, for caching)
- Redis (optional, for caching)

### Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `LOG_LEVEL` | Log level | `info` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:5173` |
| `API_URL` | Core API URL | `http://localhost:8080` |
| `DATABASE_URL` | PostgreSQL URL (optional) | - |
| `REDIS_URL` | Redis URL (optional) | - |

## API Endpoints

### Health

- `GET /health` - Health check
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Workflows (v1)

- `GET /api/v1/workflows` - List workflows
- `GET /api/v1/workflows/:id` - Get workflow
- `POST /api/v1/workflows` - Create workflow
- `POST /api/v1/workflows/:id/execute` - Execute workflow
- `GET /api/v1/executions/:id` - Get execution status

## Architecture

The BFF serves as an aggregation layer between the frontend and core API:
- Transforms and aggregates data for specific frontend needs
- Handles authentication with Keycloak
- Caches frequently accessed data
- Provides rate limiting per tenant

## License

MIT
