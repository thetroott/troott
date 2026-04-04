
<img src="apps/web/public//blocks/pacepard.svg" alt="Pacepard Logo" width="400">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![Package Manager](https://img.shields.io/badge/package%20manager-pnpm-F69220)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/build%20system-turborepo-EF4444)](https://turbo.build/)

## Pacepard

### Helping African talents unlock their superhuman potential.

> Pacepard is a reward and engagement software for talents and product teams. We support the development of Open Source Software that solves problems faced daily by Africans, and we are creating points of entry into machine learning research.

By using Pacepard, African talents, organisations, and EdTech providers can collaborate, track talent skill mastery progress, and host competitions while leveraging our AI-powered engagement analytics.


## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Adding Dependencies](#adding-dependencies)
- [Building](#building)
- [Docker Deployment](#docker-deployment)
- [Scripts Reference](#scripts-reference)
- [Contributing](#contributing)


## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized deployments) ([Download](https://www.docker.com/products/docker-desktop))

To verify your installations:

```bash
node --version  # Should be >= 20
pnpm --version  # Should be >= 9.0.0
git --version
docker --version  # Optional, for Docker deployments
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/pacepard/pacepard.git
cd pacepard
```

### Install Dependencies

Install all dependencies for the monorepo:

```bash
pnpm install
```

This will install dependencies for all apps and packages in the workspace.


## Project Structure

This is a **monorepo** managed by [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces). The project is organized as follows:

```
pacepard/
├── apps/              # Applications
│   ├── web/          # Next.js web application (@pacepard/web)
│   │   └── Dockerfile
│   ├── api/          # Express API server (@pacepard/api)
│   │   └── Dockerfile
│   ├── app/          # Main application (@pacepard/app)
│   ├── service/      # Service application (@pacepard/service)
│   │   └── Dockerfile
│   ├── docs/         # Documentation site (@pacepard/docs)
│   └── main/         # Main app entry point
│       └── Dockerfile
├── packages/          # Shared packages
│   ├── ui/           # UI component library (@pacepard/ui)
│   ├── core/         # Core package (@pacepard/core)
│   └── sdk/          # SDK package (@pacepard/sdk)
├── configs/          # Shared configurations
│   ├── eslint/       # ESLint configuration (@pacepard/configs/eslint)
│   └── typescript/   # TypeScript configuration (@pacepard/configs/typescript)
├── scripts/          # Utility scripts
├── docs/             # Documentation
│   ├── docker-setup.md
│   ├── coolify-monorepo-setup.md
│   └── github-actions-implementation.md
├── .dockerignore     # Docker ignore file
├── package.json      # Root package.json
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── turbo.json        # Turborepo configuration
└── tsconfig.json     # Root TypeScript configuration
```

### Workspace Packages

All packages use the `@pacepard/*` namespace:

- **Apps:**
  - `@pacepard/web` - Next.js web application (runs on port 3020)
  - `@pacepard/api` - Express API server
  - `@pacepard/app` - Main application
  - `@pacepard/service` - Service application
  - `@pacepard/docs` - Documentation site
  - `@pacepard/api-docs` - API documentation

- **Packages:**
  - `@pacepard/ui` - Shared UI component library (shadcn/ui based)
  - `@pacepard/core` - Core functionality
  - `@pacepard/sdk` - SDK utilities and shared logic

- **Configs:**
  - `@pacepard/configs/eslint` - Shared ESLint configuration
  - `@pacepard/configs/typescript` - Shared TypeScript configuration

---

## Development

### Running All Applications

Start all applications in development mode

For a single terminal view of builds and tasks:

```bash
pnpm dev
```

OR 

For a visual interface with Turbo UI to monitor builds and tasks (best option):

```bash
pnpm dev:ui
```

### Running Specific Applications

You can run specific applications or groups:

```bash
# Frontend applications (web + app)
pnpm dev:fe

# Backend applications (api + api-docs)
pnpm dev:be

# Individual applications
pnpm dev:web      # Next.js web app
pnpm dev:api      # Express API server
pnpm dev:app      # Main application
pnpm dev:service  # Service application
pnpm dev:docs     # API documentation
```

### Development URLs

- **Main App**: http://localhost:5176
- **Website App**: http://localhost:3020
- **Services App**: http://localhost:3015
- **API**: http://localhost:5015
- **API Docs**: http://localhost:3010

---

## Adding Dependencies

### Adding a Dependency to a Specific App or Package

To add a dependency to a specific workspace package:

```bash
# Add to a specific app/package
pnpm add <package-name> --filter @pacepard/web
pnpm add <package-name> --filter @pacepard/api
pnpm add <package-name> --filter @pacepard/ui
pnpm add <package-name> --filter @pacepard/sdk
```

### Adding a Dev Dependency

```bash
pnpm add -D <package-name> --filter @pacepard/web
```

### Adding a Root Dependency

To add a dependency at the root level (shared across all packages):

```bash
pnpm add <package-name> -w
```

### Adding a Dependency to Multiple Packages

You can add to multiple packages at once:

```bash
pnpm add <package-name> --filter @pacepard/web --filter @pacepard/app
```

### Using Workspace Packages

To use a workspace package in another package, reference it in `package.json`:

```json
{
  "dependencies": {
    "@pacepard/ui": "workspace:*",
    "@pacepard/sdk": "workspace:*"
  }
}
```

The `workspace:*` protocol tells pnpm to use the local workspace version.

---

## Building

This section provides a comprehensive guide for building the monorepo locally. The build process uses Turborepo to orchestrate builds across all packages and applications, ensuring proper dependency resolution and optimal build order.

### Build All Packages

Build all apps and packages:

```bash
pnpm build
```

This command uses Turborepo to build all packages in the correct order based on dependencies. Turborepo automatically:
- Resolves workspace dependencies (packages must build before apps that depend on them)
- Caches build outputs for faster subsequent builds
- Runs builds in parallel where possible
- Handles dependency graph resolution

### Step-by-Step Local Build Process

Follow these steps for a complete local build of the monorepo:

#### Step 1: Verify Prerequisites

Ensure you have the required tools installed:

```bash
node --version   # Should be >= 20
pnpm --version   # Should be >= 9.0.0
```

#### Step 2: Install Dependencies

From the monorepo root, install all dependencies:

```bash
pnpm install
```

This installs dependencies for:
- Root workspace dependencies
- All apps (`apps/*`)
- All packages (`packages/*`)
- All configs (`configs/*`)

**Note**: The workspace uses pnpm's hoisting strategy, so shared dependencies are installed at the root level.

#### Step 3: Understand the Build Order

Turborepo automatically handles build order based on the `dependsOn: ["^build"]` configuration in `turbo.json`. This ensures:

1. **Config packages** build first (no dependencies):
   - `@pacepard/configs/typescript` - TypeScript configurations
   - `@pacepard/configs/eslint` - ESLint configurations

2. **Shared packages** build next (depend on configs):
   - `@pacepard/core` - Core functionality (no build script, TypeScript source only)
   - `@pacepard/ui` - UI component library (no build script, TypeScript source only)
   - `@pacepard/sdk` - SDK utilities (no build script, TypeScript source only)

3. **Applications** build last (depend on packages):
   - `@pacepard/web` - Next.js web application
   - `@pacepard/api` - Express API server
   - `@pacepard/app` - Vite/React SPA (main app)
   - `@pacepard/service` - Next.js service application

#### Step 4: Build Workspace Packages (Optional)

If you want to build packages explicitly before applications:

```bash
# Build all packages
pnpm build --filter './packages/*'

# Build all configs
pnpm build --filter './configs/*'

# Build both packages and configs
pnpm build --filter './packages/*' --filter './configs/*'
```

**Note**: Most packages (`@pacepard/ui`, `@pacepard/sdk`, `@pacepard/core`) don't have build scripts as they're TypeScript source files consumed directly. However, if you need to verify TypeScript compilation, you can type-check them.

#### Step 5: Build Specific Application

Build a specific application and its dependencies:

```bash
# Build web application (Next.js)
pnpm build --filter @pacepard/web

# Build API server (Express)
pnpm build --filter @pacepard/api

# Build main app (Vite/React)
pnpm build --filter @pacepard/app

# Build service application (Next.js)
pnpm build --filter @pacepard/service
```

**Note**: Using `--filter` automatically builds all dependencies first, so you don't need to manually build packages.

#### Step 6: Build All Applications

Build all applications in the monorepo:

```bash
pnpm build
```

This command:
- Builds all packages and configs that have build scripts
- Builds all applications
- Uses Turborepo caching for faster rebuilds
- Respects dependency order automatically

### Package-Specific Build Details

Each package and application has specific build configurations. Here's what happens when you build each:

#### Applications

##### @pacepard/web (Next.js Application)
- **Package**: `apps/web/package.json`
- **Build Script**: `next build`
- **Output**: `.next/` directory (Next.js production build)
- **Dependencies**: `@pacepard/ui`, `@pacepard/core`
- **Build Details**:
  - Compiles Next.js application
  - Generates optimized production bundle
  - Outputs static pages where applicable
  - Creates server-side rendering artifacts

##### @pacepard/api (Express API Server)
- **Package**: `apps/api/package.json`
- **Build Script**: `tsc --noEmit false && tsc-alias && copyfiles -u 1 src/_data/**/* dist/ && copyfiles -u 1 src/views/**/* dist/`
- **Output**: `dist/` directory (compiled JavaScript)
- **Dependencies**: `@pacepard/configs/typescript`
- **Build Details**:
  1. Compiles TypeScript to JavaScript (`tsc`)
  2. Resolves TypeScript path aliases (`tsc-alias`)
  3. Copies static files from `src/_data/` to `dist/`
  4. Copies template files from `src/views/` to `dist/`
  - Environment variable `PORT` affects build (configured in `turbo.json`)

##### @pacepard/app (Vite/React SPA)
- **Package**: `apps/main/package.json`
- **Build Script**: `tsc -b && vite build`
- **Output**: `dist/` directory (optimized production build)
- **Dependencies**: `@pacepard/ui`, `@pacepard/sdk`, `@pacepard/core`, `@pacepard/configs/typescript`
- **Build Details**:
  1. Type-checks and compiles TypeScript (`tsc -b`)
  2. Builds production bundle with Vite
  3. Generates optimized static assets
  - Uses Vite for fast builds and code splitting

##### @pacepard/service (Next.js Service)
- **Package**: `apps/service/package.json`
- **Build Script**: `next build`
- **Output**: `.next/` directory (Next.js production build)
- **Dependencies**: `@pacepard/ui`, `@pacepard/configs/eslint`, `@pacepard/configs/typescript`
- **Build Details**:
  - Compiles Next.js application
  - Generates optimized production bundle
  - Similar to `@pacepard/web` build process

#### Packages (No Build Scripts)

These packages don't have build scripts as they're TypeScript source files consumed directly:

##### @pacepard/ui
- **Package**: `apps/packages/ui/package.json`
- **Build Script**: None (TypeScript source consumed directly)
- **Entry Point**: `./src/index.ts`
- **Usage**: Imported as `workspace:*` dependency in applications
- **Note**: TypeScript compiles these files during application builds

##### @pacepard/sdk
- **Package**: `apps/packages/sdk/package.json`
- **Build Script**: None (TypeScript source consumed directly)
- **Entry Point**: `./src/index.ts`
- **Usage**: Imported as `workspace:*` dependency in applications

##### @pacepard/core
- **Package**: `apps/packages/core/package.json`
- **Build Script**: None (TypeScript source consumed directly)
- **Entry Point**: `src/index.ts`
- **Usage**: Imported as `workspace:*` dependency in applications

##### @pacepard/configs/typescript
- **Package**: `configs/typescript/package.json`
- **Build Script**: None (JSON configuration files)
- **Usage**: Extended via `extends` in `tsconfig.json` files

##### @pacepard/configs/eslint
- **Package**: `configs/eslint/package.json`
- **Build Script**: None (JavaScript configuration files)
- **Usage**: Imported in ESLint config files

### Build Output Locations

After building, outputs are located in:

```
pacepard/
├── apps/
│   ├── web/
│   │   └── .next/           # Next.js build output
│   ├── api/
│   │   └── dist/            # Compiled JavaScript
│   ├── main/
│   │   └── dist/            # Vite build output
│   └── service/
│       └── .next/           # Next.js build output
└── packages/                # No build outputs (source TypeScript)
```

### Turborepo Build Configuration

The build process is configured in `turbo.json`:

```json
{
  "build": {
    "dependsOn": ["^build"],
    "inputs": ["$TURBO_DEFAULT$", ".env*"],
    "outputs": [".next/**", "dist/**"]
  }
}
```

- **`dependsOn: ["^build"]`**: Ensures workspace dependencies build first
- **`inputs`**: Files that trigger rebuilds (includes `.env*` files)
- **`outputs`**: Build output directories to cache

### Build Verification

After building, verify the builds:

```bash
# Check if build outputs exist
ls apps/web/.next          # Should exist for web
ls apps/api/dist           # Should exist for API
ls apps/main/dist          # Should exist for main app
ls apps/service/.next      # Should exist for service

# Run production builds locally (if supported)
cd apps/web && pnpm start
cd apps/api && pnpm start
```

### Troubleshooting Build Issues

#### Issue: "Cannot find module '@pacepard/ui'"
**Solution**: Ensure packages are built or are available as workspace dependencies:
```bash
pnpm install  # Reinstall dependencies
pnpm build --filter './packages/*'  # Build packages explicitly
```

#### Issue: TypeScript errors during build
**Solution**: Type-check before building:
```bash
pnpm check-types
```

#### Issue: Build cache issues
**Solution**: Clear Turborepo cache:
```bash
pnpm build --force
# Or
turbo run build --force
```

#### Issue: Environment variables not found
**Solution**: Ensure `.env` files are present:
```bash
# Check for .env files in application directories
ls apps/api/.env*
ls apps/web/.env*
```

#### Issue: API build fails with "tsc-alias: command not found"
**Solution**: The command is available via pnpm workspace hoisting. If issues persist:
```bash
# Ensure root has the dependency
pnpm add -D tsc-alias copyfiles -w
```

#### Issue: Workspace dependencies not resolving
**Solution**: Verify workspace protocol in `package.json`:
```json
{
  "dependencies": {
    "@pacepard/ui": "workspace:*",
    "@pacepard/sdk": "workspace:*"
  }
}
```

### Build Scripts Reference

#### Root Scripts
- `pnpm build` - Build all packages and applications
- `pnpm build --filter <package>` - Build specific package/app and dependencies
- `pnpm build --filter './packages/*'` - Build all packages
- `pnpm check-types` - Type-check all packages (doesn't emit files)

#### Application-Specific Builds
- `pnpm build --filter @pacepard/web` - Build web application
- `pnpm build --filter @pacepard/api` - Build API server
- `pnpm build --filter @pacepard/app` - Build main application
- `pnpm build --filter @pacepard/service` - Build service application

### Build Documentation

Build documentation site:

```bash
pnpm build:docs
```

---

## Docker Deployment

The monorepo includes Dockerfiles for each application, optimized for production deployment.

### Overview

Each application has its own Dockerfile:
- **API** (`apps/api/Dockerfile`) - Express server
- **Web** (`apps/web/Dockerfile`) - Next.js application
- **App** (`apps/main/Dockerfile`) - Vite/React SPA (served with nginx)
- **Service** (`apps/service/Dockerfile`) - Next.js application

All Dockerfiles use multi-stage builds for optimized production images.

### Prerequisites

- **Docker** installed and running ([Docker Desktop](https://www.docker.com/products/docker-desktop) or Docker Engine)
- Build context must be the **monorepo root directory**

### Building Docker Images

From the monorepo root, build images for each application:

```bash
# API
docker build -f apps/api/Dockerfile -t pacepard-api:latest .

# Web
docker build -f apps/web/Dockerfile -t pacepard-web:latest .

# App (Main)
docker build -f apps/main/Dockerfile -t pacepard-app:latest .

# Service
docker build -f apps/service/Dockerfile -t pacepard-service:latest .
```

### Running Docker Containers

```bash
# API (default port 3000)
docker run -p 3000:3000 --env-file .env.production pacepard-api:latest

# Web (default port 3000)
docker run -p 3000:3000 --env-file .env.production pacepard-web:latest

# App (nginx on port 80)
docker run -p 8080:80 pacepard-app:latest

# Service (default port 3000)
docker run -p 3000:3000 --env-file .env.production pacepard-service:latest
```

### Port Configuration

Default ports (configurable via `PORT` environment variable):
- **API**: 3000
- **Web**: 3000
- **App**: 80 (nginx)
- **Service**: 3000

### Monorepo Considerations

The Dockerfiles handle the monorepo structure by:

1. **Building from root context**: All Dockerfiles expect the build context to be the monorepo root
2. **Handling workspace dependencies**: Builds workspace packages (`@pacepard/ui`, `@pacepard/sdk`, etc.) before applications
3. **Multi-stage builds**: Optimizes final image size by separating build and runtime dependencies

Build order:
```bash
# 1. Install all dependencies
pnpm install --frozen-lockfile

# 2. Build workspace packages first
pnpm build --filter './packages/*' --filter './configs/*'

# 3. Build the application
pnpm build --filter @pacepard/api  # (or web, app, service)
```

### Coolify Deployment

For [Coolify](https://coolify.io) deployments:

1. **Application Type**: Select "Dockerfile"
2. **Build Context**: Set to monorepo root (`.`)
3. **Dockerfile Path**: 
   - API: `apps/api/Dockerfile`
   - Web: `apps/web/Dockerfile`
   - App: `apps/main/Dockerfile`
   - Service: `apps/service/Dockerfile`
4. **Root Directory**: 
   - API: `apps/api`
   - Web: `apps/web`
   - App: `apps/main`
   - Service: `apps/service`

### Environment Variables

Each application requires specific environment variables. Set these in your Docker deployment:

#### API
```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=<your-database-url>
REDIS_URL=<your-redis-url>
# ... other API-specific variables
```

#### Web & Service (Next.js)
```bash
PORT=3000
NODE_ENV=production
# Next.js specific environment variables
```

#### App
No Node.js environment variables needed (static files served via nginx).

### Troubleshooting

#### Build fails: "Cannot find module"
- Ensure build context is the monorepo root
- Verify workspace dependencies are built before the app
- Check that `pnpm-workspace.yaml` is correct

#### API build fails: "tsc-alias: command not found"
- These tools are available via pnpm workspace hoisting
- If issues persist, ensure they're installed at root: `pnpm add -D tsc-alias copyfiles -w`

#### Workspace dependencies not found
- Ensure packages are built: `pnpm build --filter './packages/*'`
- Verify workspace protocol in package.json: `"@pacepard/ui": "workspace:*"`

### File Structure

```
pacepard/
├── .dockerignore          # Files excluded from Docker builds
├── apps/
│   ├── api/
│   │   └── Dockerfile     # API Dockerfile
│   ├── web/
│   │   └── Dockerfile     # Web Dockerfile
│   ├── main/
│   │   └── Dockerfile     # App Dockerfile
│   └── service/
│       └── Dockerfile     # Service Dockerfile
└── docs/
    └── docker-setup.md    # Detailed Docker documentation
```

### Additional Resources

For detailed Docker setup and advanced configuration, see:
- [Docker Setup Guide](./docs/docker-setup.md) - Comprehensive Docker documentation
- [Coolify Monorepo Setup](./docs/coolify-monorepo-setup.md) - Coolify-specific deployment guide
- [GitHub Actions Implementation](./docs/github-actions-implementation.md) - CI/CD with Docker

---

## Scripts Reference

### Root Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all applications in development mode |
| `pnpm dev:fe` | Start frontend applications (web + app) |
| `pnpm dev:be` | Start backend applications (api + api-docs) |
| `pnpm dev:web` | Start web application only |
| `pnpm dev:api` | Start API server only |
| `pnpm dev:app` | Start main app only |
| `pnpm dev:service` | Start service app only |
| `pnpm dev:docs` | Start docs app only |
| `pnpm dev:ui` | Start with Turborepo UI |
| `pnpm build` | Build all packages |
| `pnpm build:docs` | Build documentation |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm check-types` | Type-check all packages |
| `pnpm clean` | Clean build artifacts |
| `pnpm clean:modules` | Remove all node_modules |
| `pnpm clean:all` | Remove node_modules and pnpm-lock.yaml |

### Package-Specific Scripts

Each app/package may have its own scripts. Check individual `package.json` files for details.

---

## Contributing

We welcome contributions! Here's how you can help:

### 1. Fork and Clone

```bash
# Fork the repository on GitHub (https://github.com/pacepard/pacepard), then:
git clone https://github.com/your-username/pacepard.git
cd pacepard
```

### 2. Create a Branch

Use the format `@username/feature-your-task` for branch names:

```bash
git checkout -b @username/feature-your-task
# or for bug fixes
git checkout -b @username/fix-your-bug-fix
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests if applicable
- Update documentation as needed

### 5. Run Checks

Before committing, ensure everything passes:

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Format code
pnpm format

# Build (optional, but recommended)
pnpm build
```

### 6. Commit Your Changes

We use [Changesets](https://github.com/changesets/changesets) for version management. For significant changes, create a changeset:

```bash
pnpm changeset
```

Follow conventional commit messages:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Standard Commit Types

Most teams follow [Conventional Commits](https://www.conventionalcommits.org/).

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, configs, dependencies |
| `refactor` | Code change that does not add features or fix bugs |
| `docs` | Documentation only |
| `test` | Tests only |
| `style` | Formatting, no logic change |
| `perf` | Performance improvement |
| `ci` | CI or pipeline changes |
| `build` | Build system or dependencies |

### 7. Keep Your Branch Up to Date

Before pushing or merging your feature, make sure your branch is up to date:

```bash
git fetch origin
git rebase origin/staging
```

### 8. Push to Remote

```bash
git push origin @username/feature-your-task
```

### 9. Create Pull Request

Create a Pull Request on GitHub with the following guidelines:

- **Target Branch**: Your PR should target `staging` — not `master`
- **Reference Issues**: Include the issue number in the PR description (e.g., `Closes #502`)
- **Add Context**: Provide context and screenshots/logs when helpful
- **Request Reviewers**: Request reviewers before merging

### 10. Merge into Staging (After PR Approval)

Once your PR is approved:

```bash
git checkout staging
git merge @username/feature-your-task-name
git push origin staging
```

### 11. Release Workflow

When ready for deployment, create a release branch from staging:

```bash
git checkout staging
git checkout -b release/v1.0.2
git push origin release/v1.0.2
```

Final QA and bug-fixing happen on this `release/*` branch before production deployment.

After final QA on the release branch, merge it into both `master` and `staging`:

```bash
# Merge into master
git checkout master
git merge release/v1.0.2
git push origin master

# Merge back into staging to ensure it stays updated
git checkout staging
git merge release/v1.0.2
git push origin staging
```

### Creating an Issue

If you discover a bug or have a suggestion, raise an issue via the GitHub Issues tab (if you have permission), or notify your team lead for triage and assignment.

### Development Guidelines

- **Code Style**: Follow the ESLint and Prettier configurations
- **TypeScript**: All code should be properly typed
- **Testing**: Add tests for new features when possible
- **Documentation**: Update README and code comments as needed
- **Workspace Packages**: Use workspace protocol (`workspace:*`) for internal dependencies

### Project-Specific Guidelines

- **UI Components**: Add new components to `@pacepard/ui` package
- **Shared Logic**: Put shared utilities in `@pacepard/sdk`
- **API Changes**: Update API documentation in `apps/docs`
- **Environment Variables**: Use `.env` files (they're gitignored)

### Pull Request Guidelines

- PRs should target the `staging` branch (not `master`)
- Reference issues using `Closes #issue-number` in the PR description
- Add context and screenshots/logs when helpful
- Request reviewers before merging

---

## Additional Resources

### Documentation
- [Docker Setup Guide](./docs/docker-setup.md) - Comprehensive Docker deployment guide
- [Coolify Monorepo Setup](./docs/coolify-monorepo-setup.md) - Coolify deployment instructions
- [GitHub Actions Implementation](./docs/github-actions-implementation.md) - CI/CD pipeline documentation
- [Workflow Documentation](./docs/workflow.md) - Development workflow and best practices

### External Resources
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.