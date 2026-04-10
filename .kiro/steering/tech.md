# Technology Stack

## Frontend

- React 18.2 + TypeScript
- Vite (build tool)
- Zustand (state management)
- TailwindCSS (styling)
- React Router DOM (routing)
- Canvas/SVG (Gantt chart rendering)
- Day.js (date handling)
- Axios (HTTP client)
- Socket.io Client (real-time collaboration)

## Backend

- Node.js + Express + TypeScript
- PostgreSQL 14+ (database)
- Redis 7+ (caching)
- Socket.io (real-time collaboration)
- JWT (authentication)
- Bcrypt (password hashing)
- Zod (validation)
- Claude API (AI file parsing)

## DevOps

- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Kubernetes (production deployment)

## Build System

- Frontend: Vite with TypeScript compilation
- Backend: TypeScript compiler (tsc) with tsx for development
- Both use ESM modules (`"type": "module"`)

## Common Commands

### Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Frontend development (port 5173)
cd frontend
npm install
npm run dev

# Backend development (port 3000)
cd backend
npm install
npm run dev
```

### Building

```bash
# Frontend build
cd frontend
npm run build

# Backend build
cd backend
npm run build
npm start
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Requirements

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

## TypeScript Configuration

- Frontend: ES2020 target, strict mode, React JSX
- Backend: ES2022 target, strict mode, ESM modules
- Both enforce strict type checking with no unused locals/parameters
