# RBAC Server

This high-performance, enterprise-grade backend API powers a **Dynamic Permission-Based Role Access Control (RBAC)** system. Built on the principle of **Atomic Permission Control**, every access decision is driven by specific, granular permission slugs — not role labels alone. This ensures a flexible grant-ceiling model where no user can assign or grant more than they themselves hold.

---

## Table of Contents

- [RBAC Server](#rbac-server)
  - [Table of Contents](#table-of-contents)
  - [Core Modules and Features](#core-modules-and-features)
    - [Authentication \& Security](#authentication--security)
    - [User \& Role Management](#user--role-management)
    - [Permission Engine](#permission-engine)
    - [Business Modules](#business-modules)
    - [Audit System](#audit-system)
  - [Tech Stack](#tech-stack)
  - [Security and Data Protection](#security-and-data-protection)
  - [Architecture](#architecture)
    - [System Architecture Diagram](#system-architecture-diagram)
    - [Internal Dependency Flow](#internal-dependency-flow)
  - [Cross-Module Relational Logic](#cross-module-relational-logic)
  - [Project Directory Map](#project-directory-map)
  - [Database Schema](#database-schema)
    - [Entity-Relationship Diagram](#entity-relationship-diagram)
  - [Detailed API Endpoints](#detailed-api-endpoints)
  - [Endpoint Operation Patterns](#endpoint-operation-patterns)
  - [Workflow Diagrams](#workflow-diagrams)
    - [Authentication \& Permission Check Workflow](#authentication--permission-check-workflow)
  - [Development and Deployment](#development-and-deployment)
    - [Development Setup](#development-setup)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Production Strategy](#production-strategy)
  - [Production Readiness Checklist](#production-readiness-checklist)
  - [License](#license)

---

## Core Modules and Features

### Authentication & Security

- **JWT Dual-Token Architecture**: Short-lived `access_token` (15m) delivered in response body and a long-lived `refresh_token` (7d) stored in a secure `httpOnly` cookie for seamless token rotation.
- **Rate Limiting**: Dedicated `authRateLimiter` on all `/api/v1/auth` endpoints to prevent brute-force attacks, alongside a global limiter for system-wide traffic governance.
- **Password Security**: Bcrypt hashing with configurable salt rounds (default: 12) and invalidation logic: any token issued before the last `password_changed_at` timestamp is automatically rejected.
- **Password Reset Flow**: Email-based OTP/link for forgotten passwords via `Nodemailer`.

### User & Role Management

- **Dynamic User Lifecycle**: Full user management including soft-delete, restore, suspend, and ban operations.
- **Grant Ceiling Enforcement**: Users can only assign permissions they already possess themselves — enforced at the service layer.
- **User-Level Permission Override**: Direct `UserPermission` assignments complement role-based permissions for surgical access control.
- **Role CRUD**: Full create, update, delete support for roles with permission assignments.

### Permission Engine

- **Atomic Permission Slugs**: All permissions are identified by a `slug` string (e.g., `manage_users`, `view_reports`), which acts as the single source of truth for access control.
- **Grouped Permission View**: Permissions are grouped by `module` (e.g., `users`, `reports`) for easier management UI.
- **Dynamic JWT Payload**: The resolved set of a user's permissions (union of role permissions + direct overrides) is embedded directly into the JWT access token payload.

### Business Modules

- **Leads**: Full CRUD for CRM leads, guarded by `view_leads` and `manage_leads` permission atoms.
- **Tasks**: Task lifecycle management with assignee tracking, guarded by `view_tasks` and `manage_tasks`.
- **Reports**: Business report storage and retrieval, guarded by `view_reports` and `manage_reports`.

### Audit System

- **Automatic Intercept via Prisma Extension**: The Prisma client is extended with a `$allOperations` hook that automatically logs every write operation (`create`, `update`, `delete`) to the `audit_logs` table — requiring zero manual calls in the service layer.
- **AsyncLocalStorage Context**: The authenticated user's ID is passed to the Prisma extension via Node.js `AsyncLocalStorage`, ensuring every automated log entry is correctly attributed to the actor without polluting function signatures.
- **Personal Log Access**: Any authenticated user can view their own audit trail via `GET /api/v1/audit-logs/me`.

---

## Tech Stack

| Category             | Technology                                    |
| :------------------- | :-------------------------------------------- |
| Runtime Environment  | Node.js (v18+)                                |
| Core Framework       | Express.js (v5.x)                             |
| Programming Language | TypeScript (v5.x)                             |
| Persistent Storage   | PostgreSQL with Prisma ORM (v7.x)             |
| DB Driver Adapter    | `@prisma/adapter-pg` (pg Pool for serverless) |
| Runtime Validation   | Zod (v4.x)                                    |
| Authentication       | `jsonwebtoken` (JWT)                          |
| Password Hashing     | `bcrypt`                                      |
| Email Service        | `Nodemailer`                                  |
| Rate Limiting        | `express-rate-limit`                          |

---

## Security and Data Protection

### Defensive Security Layers

- **Traffic Governance (Rate Limiting)**:
  - **Global Limiter**: Restricts all incoming traffic to prevent broad abuse.
  - **Auth Limiter**: Applies strict, tighter thresholds on all `/api/v1/auth` routes to thwart credential stuffing and brute-force login attacks.
- **Soft Delete Pattern**: Users and data are logically flagged as deleted rather than permanently purged, maintaining historical auditability.
- **Token Invalidation on Password Change**: The `isJWTIssuedBeforePasswordChanged` utility ensures that any access token issued before a password change event is automatically rejected, preventing use of stolen old tokens.

### Authentication & Authorization

- **Stateless JWT Authentication**: `auth()` middleware validates every incoming Bearer token, verifies the signature, and checks user status (`suspended`, `banned`, `deleted`) on every request.
- **Atomic Permission Guard**: `access('permission_slug')` middleware runs after `auth()` and checks if the decoded JWT payload's `permissions` array contains the required slug, returning `403 Forbidden` if not.
- **Role-Based Routing**: `auth('admin', 'manager', ...)` can optionally restrict routes by role type in addition to permission checks.
- **Input Integrity (Zod)**: Every API endpoint is guarded by a `validation()` middleware using Zod schemas, rejecting malformed requests before they reach the service layer.

---

## Architecture

### System Architecture Diagram

<div align="center">

```mermaid
graph TB
    Client[Frontend Client / Browser]
    Proxy[Next.js Proxy Middleware]
    RateLimit[Global Rate Limiter]
    Auth[Auth Middleware - JWT Verify]
    Access[Access Middleware - Permission Slug Check]
    Controller[Module Controller]
    Service[Domain Service]
    Prisma[Prisma ORM + Extension Hook]
    DB[(PostgreSQL Database)]
    AuditLog[(audit_logs Table)]
    Email[Nodemailer - SMTP]

    Client --> Proxy
    Proxy --> RateLimit
    RateLimit --> Auth
    Auth --> Access
    Access --> Controller
    Controller --> Service
    Service --> Prisma
    Prisma --> DB
    Prisma -->|Auto audit intercept| AuditLog
    Service -->|Password Reset| Email
```

</div>

### Internal Dependency Flow

<div align="center">

```mermaid
graph LR
    Router[API Router]
    AuthMid[auth middleware]
    AccessMid[access middleware]
    ValidMid[validation middleware]
    Controller[Controller]
    Service[Service]
    Repository[Repository]
    Prisma[Prisma Client]

    Router --> AuthMid
    AuthMid --> AccessMid
    AccessMid --> ValidMid
    ValidMid --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Prisma
```

</div>

---

## Cross-Module Relational Logic

### 1. Permission Resolution Pipeline

When a user authenticates, the system resolves a **union** of permissions:

- Permissions from the user's `Role` (via `role_permissions` table)
- Direct permission overrides assigned to the user (via `user_permissions` table)

This resolved set is embedded into the JWT payload as `permissions: string[]`, which the `access()` middleware then reads on every subsequent request — eliminating a database call per route.

### 2. Grant Ceiling Enforcement

When an admin or manager assigns permissions to another user or role, the backend service validates that **every slug being assigned is already present** in the assigning user's own resolved permission set. Attempting to grant a permission you don't hold results in a `403 Forbidden` response.

### 3. Automatic Audit Trail

The Prisma client is configured with a `$extends` hook on `$allModels.$allOperations`. Every write operation (`create`, `update`, `delete`, etc.) automatically creates an entry in `audit_logs` with:

- The acting `user_id` (from `AsyncLocalStorage` context)
- The `operation` name (e.g., `UPDATE`)
- The `resource` (model name, e.g., `User`)
- The `resource_id` and `details` payload

This means **zero manual audit calls** are required in any service file — the audit happens transparently at the data layer.

---

## Project Directory Map

```text
src/
├── app/
│   ├── builder/
│   │   └── app-error.ts         # Custom typed AppError class
│   ├── config/
│   │   ├── db.ts                # Prisma client + pg adapter + auto-audit extension
│   │   └── env.ts               # Zod-validated environment config
│   ├── errors/                  # Centralized error handler utilities
│   ├── interfaces/              # Global TypeScript interface definitions
│   ├── middlewares/
│   │   ├── auth.middleware.ts          # JWT verification + user status check
│   │   ├── access.middleware.ts        # Permission slug enforcement
│   │   ├── validation.middleware.ts    # Zod schema validation
│   │   ├── rate-limit.middleware.ts    # Global + auth rate limiters
│   │   ├── error.middleware.ts         # Centralized error response handler
│   │   └── not-found.middleware.ts     # 404 catch-all handler
│   ├── modules/
│   │   ├── auth/               # Signup, signin, refresh, change/forget/reset password
│   │   ├── user/               # User CRUD, status management, permission assignment
│   │   ├── role/               # Role CRUD, permission assignment to roles
│   │   ├── permission/         # Permission listing and grouped views
│   │   ├── audit-log/          # Audit log listing (all and personal)
│   │   ├── lead/               # Lead CRM — CRUD with permission guards
│   │   ├── task/               # Task management — CRUD with permission guards
│   │   └── report/             # Report storage — CRUD with permission guards
│   ├── routes/
│   │   └── index.ts            # Global route aggregator under /api/v1
│   ├── types/                  # Shared TypeScript type definitions (TRole, etc.)
│   └── utils/
│       ├── catch-async.ts      # Async error wrapper for controllers
│       ├── send-response.ts    # Standardized API response utility
│       └── async-storage.ts    # AsyncLocalStorage for user context propagation
├── app.ts                      # Express app pipeline and global middleware setup
└── index.ts                    # Server bootloader (supports Vercel serverless)
```

---

## Database Schema

### Entity-Relationship Diagram

<div align="center">

```mermaid
erDiagram
    User ||--o{ UserPermission : "has_direct_permissions"
    User ||--o{ AuditLog : "authors"
    User ||--o{ Task : "assigned_to"
    User }o--|| Role : "belongs_to"

    Role ||--o{ RolePermission : "has_permissions"

    Permission ||--o{ RolePermission : "assigned_to_roles"
    Permission ||--o{ UserPermission : "assigned_to_users"

    User {
        Int id PK
        String name
        String email "Unique"
        String password "Hashed"
        Int role_id FK
        Status status "active|suspended|banned"
        Boolean is_deleted
        DateTime password_changed_at
        DateTime created_at
        DateTime updated_at
    }

    Role {
        Int id PK
        String name "Unique"
        String description
        DateTime created_at
        DateTime updated_at
    }

    Permission {
        Int id PK
        String name
        String slug "Unique"
        String module "e.g. users, reports"
        DateTime created_at
        DateTime updated_at
    }

    RolePermission {
        Int role_id FK
        Int permission_id FK
    }

    UserPermission {
        Int user_id FK
        Int permission_id FK
    }

    AuditLog {
        Int id PK
        Int user_id FK
        String action "e.g. UPDATE"
        String resource "e.g. User"
        String resource_id
        Json details
        String ip_address
        DateTime created_at
    }

    Lead {
        Int id PK
        String first_name
        String last_name
        String email
        String phone
        String source
        String status "default: new"
        DateTime created_at
        DateTime updated_at
    }

    Task {
        Int id PK
        String title
        String description
        String status "default: pending"
        String priority "default: medium"
        DateTime due_date
        Int assignee_id FK
        DateTime created_at
        DateTime updated_at
    }

    Report {
        Int id PK
        String name
        String type
        Json data
        DateTime created_at
        DateTime updated_at
    }
```

</div>

---

## Detailed API Endpoints

All routes are served under the `/api/v1` namespace. Every protected route requires a valid `Authorization: Bearer <access_token>` header.

### Authentication — `/api/v1/auth`

| Method  | Endpoint           | Permission        | Description                                 |
| :------ | :----------------- | :---------------- | :------------------------------------------ |
| `POST`  | `/signup`          | Public            | Register a new user account                 |
| `POST`  | `/signin`          | Public            | Login and receive tokens                    |
| `POST`  | `/refresh-token`   | Public (cookie)   | Exchange refresh token for new access token |
| `PATCH` | `/change-password` | Authenticated     | Change password for logged-in user          |
| `POST`  | `/forget-password` | Public            | Send password reset email                   |
| `PATCH` | `/reset-password`  | Public (via link) | Reset password using OTP/token              |

### Users — `/api/v1/users`

| Method   | Endpoint              | Permission     | Description                          |
| :------- | :-------------------- | :------------- | :----------------------------------- |
| `GET`    | `/me`                 | Authenticated  | Get the currently authenticated user |
| `PATCH`  | `/me`                 | Authenticated  | Update own profile                   |
| `GET`    | `/`                   | `manage_users` | List all users with pagination       |
| `GET`    | `/:id`                | `manage_users` | Get a single user by ID              |
| `PATCH`  | `/:id`                | `manage_users` | Update a user                        |
| `DELETE` | `/:id`                | `manage_users` | Soft delete a user                   |
| `DELETE` | `/:id/permanent`      | `manage_users` | Permanently delete a user            |
| `PATCH`  | `/:id/restore`        | `manage_users` | Restore a soft-deleted user          |
| `PATCH`  | `/:id/suspend`        | `manage_users` | Suspend a user                       |
| `PATCH`  | `/:id/ban`            | `manage_users` | Ban a user                           |
| `POST`   | `/assign-permissions` | `manage_users` | Assign direct permissions to a user  |

### Roles — `/api/v1/roles`

| Method   | Endpoint              | Permission     | Description                  |
| :------- | :-------------------- | :------------- | :--------------------------- |
| `GET`    | `/`                   | `manage_roles` | List all roles               |
| `POST`   | `/`                   | `manage_roles` | Create a new role            |
| `GET`    | `/:id`                | `manage_roles` | Get a single role by ID      |
| `PATCH`  | `/:id`                | `manage_roles` | Update a role                |
| `DELETE` | `/:id`                | `manage_roles` | Delete a role                |
| `POST`   | `/assign-permissions` | `manage_roles` | Assign permissions to a role |

### Permissions — `/api/v1/permissions`

| Method | Endpoint   | Permission     | Description                                |
| :----- | :--------- | :------------- | :----------------------------------------- |
| `GET`  | `/`        | `manage_roles` | List all permissions with pagination       |
| `GET`  | `/grouped` | `manage_roles` | Get all permissions grouped by module name |
| `GET`  | `/:id`     | `manage_roles` | Get a single permission by ID              |

### Audit Logs — `/api/v1/audit-logs`

| Method | Endpoint | Permission        | Description                          |
| :----- | :------- | :---------------- | :----------------------------------- |
| `GET`  | `/`      | `view_audit_logs` | List all system audit logs           |
| `GET`  | `/me`    | Authenticated     | List audit logs for the current user |

### Leads — `/api/v1/leads`

| Method   | Endpoint | Permission     | Description       |
| :------- | :------- | :------------- | :---------------- |
| `GET`    | `/`      | `view_leads`   | List all leads    |
| `GET`    | `/:id`   | `view_leads`   | Get a lead by ID  |
| `POST`   | `/`      | `manage_leads` | Create a new lead |
| `PATCH`  | `/:id`   | `manage_leads` | Update a lead     |
| `DELETE` | `/:id`   | `manage_leads` | Delete a lead     |

### Tasks — `/api/v1/tasks`

| Method   | Endpoint | Permission     | Description       |
| :------- | :------- | :------------- | :---------------- |
| `GET`    | `/`      | `view_tasks`   | List all tasks    |
| `GET`    | `/:id`   | `view_tasks`   | Get a task by ID  |
| `POST`   | `/`      | `manage_tasks` | Create a new task |
| `PATCH`  | `/:id`   | `manage_tasks` | Update a task     |
| `DELETE` | `/:id`   | `manage_tasks` | Delete a task     |

### Reports — `/api/v1/reports`

| Method   | Endpoint | Permission       | Description         |
| :------- | :------- | :--------------- | :------------------ |
| `GET`    | `/`      | `view_reports`   | List all reports    |
| `GET`    | `/:id`   | `view_reports`   | Get a report by ID  |
| `POST`   | `/`      | `manage_reports` | Create a new report |
| `PATCH`  | `/:id`   | `manage_reports` | Update a report     |
| `DELETE` | `/:id`   | `manage_reports` | Delete a report     |

---

## Endpoint Operation Patterns

Standardized patterns are enforced across all domain modules:

- **Listings**: `GET /api/v1/{module}` — Server-side pagination, search, and filtering.
- **Detail**: `GET /api/v1/{module}/:id` — Fetch a fully-populated single resource.
- **Creation**: `POST /api/v1/{module}` — Zod-validated, sanitized creation.
- **Modification**: `PATCH /api/v1/{module}/:id` — Partial updates only.
- **Soft Delete**: `DELETE /api/v1/{module}/:id` — Logical deletion for auditability.
- **Permanent Delete**: `DELETE /api/v1/{module}/:id/permanent` — Full data removal.
- **Restoration**: `PATCH /api/v1/{module}/:id/restore` — Reverses a soft delete.

---

## Workflow Diagrams

### Authentication & Permission Check Workflow

<div align="center">

```mermaid
sequenceDiagram
    participant C as Client
    participant API as RBAC API
    participant DB as PostgreSQL

    C->>API: POST /api/v1/auth/signin { email, password }
    API->>DB: Find user by email, load role + permissions
    DB-->>API: User record with resolved permissions
    API->>API: bcrypt.compare(password, hash)
    API->>API: Sign access_token (payload: id, role, permissions[])
    API->>API: Sign refresh_token → set httpOnly cookie
    API-->>C: 200 OK { access_token, user_info }

    C->>API: GET /api/v1/users (Bearer access_token)
    API->>API: auth() → jwt.verify(token) → check status
    API->>API: access('manage_users') → check permissions[]
    alt Has permission
        API->>DB: Query users table
        DB-->>API: Paginated user list
        API-->>C: 200 OK { data, meta }
    else No permission
        API-->>C: 403 Forbidden
    end
```

</div>

---

## Development and Deployment

### Development Setup

1. **Dependency Installation**:

   ```bash
   pnpm install
   ```

2. **Configuration**:
   Copy `.env.example` to `.env` and fill in all required values:

   ```bash
   cp .env.example .env
   ```

3. **Running in Dev Mode**:

   ```bash
   pnpm run dev
   ```

### Environment Variables

| Variable                        | Description                              | Example                                |
| :------------------------------ | :--------------------------------------- | :------------------------------------- |
| `NODE_ENV`                      | Runtime environment                      | `development`                          |
| `PORT`                          | Server port                              | `5000`                                 |
| `DATABASE_URL`                  | PostgreSQL connection string (pooled)    | `postgresql://user:pass@host:5432/db`  |
| `DIRECT_DATABASE_URL`           | Direct URL for Prisma migrations         | `postgresql://user:pass@host:5432/db`  |
| `BCRYPT_SALT_ROUNDS`            | Cost factor for bcrypt hashing           | `12`                                   |
| `JWT_ACCESS_SECRET`             | Secret key for signing access tokens     | `your_32char_random_secret`            |
| `JWT_ACCESS_SECRET_EXPIRES_IN`  | Access token TTL                         | `1h`                                   |
| `JWT_REFRESH_SECRET`            | Secret key for signing refresh tokens    | `your_32char_random_secret`            |
| `JWT_REFRESH_SECRET_EXPIRES_IN` | Refresh token TTL                        | `7d`                                   |
| `RESET_PASSWORD_UI_LINK`        | Frontend URL for password reset redirect | `http://localhost:3000/reset-password` |
| `AUTH_USER_EMAIL`               | Gmail address for sending system emails  | `your_email@gmail.com`                 |
| `AUTH_USER_EMAIL_PASSWORD`      | Google App Password for SMTP             | `your_app_password`                    |

> **Tip**: Generate secure JWT secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Database Setup

1. **Run migrations**:

   ```bash
   pnpm prisma:migrate initial_migration
   ```

2. **Seed initial data** (admin user, default roles, and all permission atoms):

   ```bash
   npx prisma db seed
   ```

3. **Open Prisma Studio** (optional, for visual DB browsing):

   ```bash
   pnpm prisma:studio
   ```

### Production Strategy

1. **Build & Transpile**:

   ```bash
   pnpm build
   ```

2. **Run Production Server**:

   ```bash
   pnpm start
   ```

3. **Deploy on Vercel**:
   - Set **Build Command** to: `pnpm run vercel-build` (this runs `tsc` + `prisma generate` + `prisma migrate deploy`)
   - Set all required environment variables in Vercel project settings.
   - The `src/index.ts` conditionally skips `app.listen()` when `process.env.VERCEL` is set, exporting `app` as a serverless handler instead.

---

## Production Readiness Checklist

- [x] **Type Safety**: Full TypeScript coverage with strict compilation (`tsc -p tsconfig.build.json` passes with 0 errors).
- [x] **Input Validation**: Zod schemas guard every API entry point via `validation()` middleware.
- [x] **Authentication**: Dual-token JWT system with password change invalidation.
- [x] **Authorization**: Atomic permission slug guard (`access()`) on every protected route.
- [x] **Grant Ceiling**: Service-layer enforcement prevents privilege escalation.
- [x] **Automatic Auditing**: Prisma extension auto-logs all write operations via `AsyncLocalStorage`.
- [x] **Rate Limiting**: Global and auth-specific rate limiters protect against abuse.
- [x] **Soft Delete**: Data lifecycle management preserves historical records.
- [x] **Serverless Ready**: Conditional bootloader supports both traditional Node.js and Vercel serverless environments.
- [x] **Database Migrations**: Prisma migration history tracked and deployable via `prisma migrate deploy`.

---

## License

Proprietary and Confidential. Unauthorized duplication or distribution is strictly prohibited.
