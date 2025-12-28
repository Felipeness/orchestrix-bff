# Orchestrix BFF

**Backend for Frontend** da plataforma Orchestrix AIOps - camada de agregação, transformação e otimização para o frontend.

## O que é o Orchestrix?

Orchestrix é uma plataforma AIOps completa que **substitui Grafana + Datadog + Prometheus + PagerDuty** e adiciona inteligência artificial para entender, explicar e resolver problemas automaticamente.

> Veja [VISION.md](../VISION.md) para a visão completa do projeto.

## Responsabilidades do BFF

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRIX BFF                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AGGREGATION             OPTIMIZATION          SECURITY         │
│  ───────────             ────────────          ────────         │
│  • Combine API calls     • Response caching    • Auth tokens    │
│  • Dashboard data        • Rate limiting       • CORS           │
│  • Timeline assembly     • Compression         • Validation     │
│  • Stats computation     • Pagination          • Sanitization   │
│                                                                  │
│  FRONTEND-SPECIFIC                                              │
│  ────────────────                                               │
│  • Dashboard presets     • Chart data format                    │
│  • Widget configs        • Real-time (WebSocket planned)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Por que um BFF?

1. **Performance** - Agrega múltiplas chamadas ao API em uma única resposta
2. **Segurança** - Tokens Keycloak nunca expostos ao browser diretamente
3. **Flexibilidade** - Transforma dados no formato ideal para o frontend
4. **Cache** - Redis para dados frequentemente acessados
5. **Rate Limiting** - Proteção por tenant

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Bun | Fast JS runtime |
| Framework | Fastify | High-performance HTTP |
| FP | Effect-TS | Composable error handling |
| Validation | Zod | Type-safe schemas |
| Cache | Redis (ioredis) | Response caching |
| ORM | Drizzle | Database access |

## Project Structure

```
orchestrix-bff/
├── src/
│   ├── index.ts           # Entry point
│   ├── routes/            # Fastify route handlers
│   │   ├── alert.ts       # Alert routes
│   │   ├── audit.ts       # Audit log routes
│   │   ├── health.ts      # Health checks
│   │   └── workflow.ts    # Workflow routes
│   ├── services/          # Business logic & API calls
│   │   ├── alert.ts       # Alert service
│   │   ├── audit.ts       # Audit service
│   │   └── workflow.ts    # Workflow service
│   ├── middleware/        # Fastify plugins
│   │   └── auth.ts        # Keycloak auth
│   ├── schemas/           # Zod validation schemas
│   └── lib/               # Utilities
│       └── api-client.ts  # Core API client
├── drizzle/
│   ├── schema.ts          # Database schema
│   └── migrations/        # SQL migrations
└── openapi.yaml           # API documentation
```

## Current Status

### Implemented
- [x] Keycloak authentication passthrough
- [x] Workflow CRUD proxying
- [x] Workflow execution
- [x] Alert management
- [x] Audit log access
- [x] Health checks
- [x] CORS configuration
- [x] OpenAPI documentation

### In Progress
- [ ] Redis caching layer
- [ ] Rate limiting per tenant
- [ ] Dashboard aggregation

### Planned (Phase 1-6)
- [ ] WebSocket for real-time updates
- [ ] Metrics query proxying
- [ ] Log search proxying
- [ ] Dashboard presets API
- [ ] Chart data formatting
- [ ] Incident timeline assembly
- [ ] On-call status aggregation

## API Endpoints

### Current APIs

```
Health
├── GET  /health              # Health check
├── GET  /health/live         # Liveness probe
└── GET  /health/ready        # Readiness probe

Workflows (proxies to Core API)
├── GET    /api/v1/workflows           # List workflows
├── POST   /api/v1/workflows           # Create workflow
├── GET    /api/v1/workflows/:id       # Get workflow
├── PUT    /api/v1/workflows/:id       # Update workflow
├── DELETE /api/v1/workflows/:id       # Delete workflow
├── POST   /api/v1/workflows/:id/execute  # Execute workflow
└── GET    /api/v1/workflows/:id/executions  # List executions

Executions
├── GET  /api/v1/executions            # List executions
└── GET  /api/v1/executions/:id        # Get execution

Alerts
├── GET  /api/v1/alerts                # List alerts
├── POST /api/v1/alerts                # Create alert
├── GET  /api/v1/alerts/:id            # Get alert
├── POST /api/v1/alerts/:id/acknowledge  # Acknowledge
└── POST /api/v1/alerts/:id/resolve      # Resolve

Audit Logs
└── GET  /api/v1/audit-logs            # List audit logs
```

### Planned Aggregation APIs

```
Dashboard (Phase 1)
├── GET  /api/v1/dashboard/stats       # Aggregated stats
├── GET  /api/v1/dashboard/presets     # Dashboard presets
└── GET  /api/v1/dashboard/:id/widgets # Widget data

Metrics (Phase 1)
├── GET  /api/v1/metrics/chart         # Formatted for charts
└── GET  /api/v1/metrics/table         # Formatted for tables

Incidents (Phase 4)
├── GET  /api/v1/incidents/:id/full    # Incident + timeline + alerts
└── GET  /api/v1/incidents/active      # Active incidents summary

Real-time (Phase 1)
└── WS   /api/v1/ws                    # WebSocket connection
```

## Getting Started

### Prerequisites

- Bun 1.0+
- Redis (optional, for caching)
- Core API running

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
| `REDIS_URL` | Redis URL (optional) | - |
| `DATABASE_URL` | PostgreSQL URL (optional) | - |

## Data Flow

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│     BFF     │────▶│   Core API   │
│   (React)    │◀────│  (Fastify)  │◀────│    (Go)      │
└──────────────┘     └──────┬──────┘     └──────────────┘
                           │
                     ┌─────▼─────┐
                     │   Redis   │
                     │  (Cache)  │
                     └───────────┘
```

## Architecture Principles

1. **Thin layer** - Minimal business logic, mostly aggregation
2. **Cache-first** - Redis for frequently accessed data
3. **Type-safe** - Zod schemas, Effect-TS for errors
4. **Observable** - Structured logging, request tracing
5. **Resilient** - Circuit breaker for API calls (planned)

## License

MIT
