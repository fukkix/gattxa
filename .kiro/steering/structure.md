# Project Structure

## Monorepo Layout

```
ganttflow/
├── frontend/           # React frontend application
├── backend/            # Node.js backend API
├── database/           # Database initialization scripts
├── docs/               # Project documentation
├── .kiro/              # Kiro AI assistant configuration
├── docker-compose.yml  # Docker orchestration
└── README.md
```

## Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx
│   │   ├── EditorPage.tsx
│   │   └── SharePage.tsx
│   ├── store/                # Zustand state management
│   │   └── projectStore.ts
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                # Utility functions
│       ├── dateUtils.ts
│       └── ganttRenderer.ts  # Canvas/SVG rendering logic
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
└── Dockerfile
```

## Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   └── requestLogger.ts # Request logging
│   └── routes/               # API route handlers
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .env.example
└── Dockerfile
```

## Database (`database/`)

- `init.sql`: PostgreSQL schema initialization
- Tables: users, projects, tasks, share_links, comments, project_versions

## Documentation (`docs/`)

- `API.md`: API endpoint documentation
- `SETUP.md`: Environment setup guide

## Architecture Patterns

### Frontend

- Page-based routing with React Router
- Centralized state management with Zustand
- Utility-first CSS with TailwindCSS
- Custom Canvas/SVG rendering for Gantt charts
- Type-safe API calls with Axios

### Backend

- RESTful API design with Express
- Middleware-based request processing
- Route-based organization
- PostgreSQL for persistent data
- Redis for caching and sessions
- Socket.io for real-time features

### Database

- UUID primary keys
- Foreign key constraints with CASCADE
- Indexed columns for performance (user_id, project_id, dates)
- JSONB for flexible data (dependencies, mentions)
- Timestamp tracking (created_at, updated_at)

## Code Style

- ESLint + Prettier for consistent formatting
- TypeScript strict mode enabled
- No unused variables/parameters (warn level)
- React hooks rules enforced
- Explicit `any` types discouraged (warn level)
