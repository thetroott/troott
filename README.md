[License: MIT](https://opensource.org/licenses/MIT)
[Node.js Version](https://nodejs.org/)
[Package Manager](https://pnpm.io/)
[Turborepo](https://turbo.build/)

## Troott

### Helping African talents unlock their superhuman potential.

> Troott is a reward and engagement software for talents and product teams. We support the development of Open Source Software that solves problems faced daily by Africans, and we are creating points of entry into machine learning research.

By using Troott, African talents, organisations, and EdTech providers can collaborate, track talent skill mastery progress, and host competitions while leveraging AI-powered engagement analytics.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development](#development)
- [Adding Dependencies](#adding-dependencies)
- [Building](#building)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 22.x ([Download](https://nodejs.org/))
- **pnpm** >= 10.33.0 ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized deployments) ([Download](https://www.docker.com/products/docker-desktop))

To verify your installations:

```bash
node --version  # Should be >= 22
pnpm --version  # Should be >= 10.33.0
git --version
docker --version  # Optional, for Docker deployments
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/thetroott/troott.git
cd troott
```

### Install Dependencies

Install all dependencies for the monorepo:

```bash
pnpm install
```

This will install dependencies for all apps and packages in the workspace.

### Environment setup

Each app reads its own `.env` file (gitignored). Copy the samples before first run:

```bash
cp apps/api/example.env apps/api/.env
cp apps/web/.env.sample apps/web/.env
cp apps/website/.env.sample apps/website/.env
cp apps/mobile/.env.sample apps/mobile/.env
```

Edit `apps/api/.env` for MongoDB, JWT, AWS, Redis, and mail. Point all clients at the same API origin.

#### Local ports and URLs

| App | Package | Dev command | URL |
| --- | ------- | ----------- | --- |
| API | `@troott/api` | `pnpm dev:api` | http://localhost:**5025** (`PORT` in `apps/api/.env`) |
| Studio web | `@troott/web` | `pnpm dev:web` | http://localhost:**5053** |
| Marketing site | `@troott/website` | `pnpm dev:website` | http://localhost:**3051** |
| Mobile | `@troott/mobile` | `pnpm dev:mobile` | Expo dev server (see terminal) |

#### Client → API env vars

| App | Variable | Example (local) |
| --- | -------- | ----------------- |
| Web | `VITE_APP_API_URL` | `http://localhost:5025` |
| Website | `NEXT_PUBLIC_APP_API_URL` | `http://localhost:5025` |
| Mobile | `EXPO_PUBLIC_API_URL` | `http://localhost:5025` |

The web client appends `/api/v1` in code. CORS on the API must allow the web and website origins — see `CORS_ALLOWED_ORIGINS` and `CLIENT_LOCAL_*` in [`apps/api/example.env`](apps/api/example.env).

## Project Structure

This is a **monorepo** managed by [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces). The project is organized as follows:

```
troott/
├── apps/              # Applications
│   ├── website/      # Next.js site (@troott/website) — Dockerfile, dev port 3051
│   ├── web/          # Vite/React SPA (@troott/web) — Dockerfile, dev port 5053
│   ├── api/          # API server (@troott/api) — Dockerfile, default PORT 5025
│   └── mobile/       # Expo app (@troott/mobile)
├── packages/          # Shared packages
│   ├── ui/           # Web UI primitives (@troott/ui)
│   ├── api-client/   # Shared API client (@troott/api-client)
│   ├── tokens/       # Design tokens (@troott/tokens)
│   └── native-ui/    # Native UI (@troott/native-ui)
├── configs/          # Shared configurations
│   ├── eslint/       # @troott/configs/eslint
│   └── typescript/   # @troott/configs-typescript
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

Workspace apps and packages use the `@troott/*` namespace (examples):

- **Apps:**
    - `@troott/website` - Next.js site (marketing/docs)
    - `@troott/web` - Vite/React SPA
    - `@troott/api` - API server
    - `@troott/mobile` - Expo (React Native)
- **Packages:**
    - `@troott/ui` - Web UI / shadcn-style components
    - `@troott/api-client` - Shared client utilities and hooks
    - `@troott/tokens` - Design tokens
    - `@troott/native-ui` - React Native UI primitives
- **Configs:**
    - `@troott/configs/eslint` - Shared ESLint configuration
    - `@troott/configs-typescript` - Shared TypeScript configuration

---

## Development

### Running All Applications

Start all applications in development mode

For a single terminal view of builds and tasks:

```bash
pnpm dev
```

OR

The default `pnpm dev` script enables Turbo UI (`TURBO_UI=tui`).

### Running Specific Applications

You can run specific applications or groups:

```bash
# Frontend (Next.js marketing site + Vite app)
pnpm dev:fe

# One app at a time
pnpm dev:website  # Next.js (`apps/website`)
pnpm dev:web      # Vite SPA (`apps/web`)
pnpm dev:api      # API (`apps/api`)
pnpm dev:mobile   # Expo (`apps/mobile`)
```

Production preview for the studio web (after `pnpm build:web`):

```bash
pnpm --filter @troott/web start   # vite preview on port 5053 by default
```

---

## Adding Dependencies

### Adding a Dependency to a Specific App or Package

To add a dependency to a specific workspace package:

```bash
pnpm add <package-name> --filter @troott/web
pnpm add <package-name> --filter @troott/website
pnpm add <package-name> --filter @troott/api
pnpm add <package-name> --filter @troott/mobile
pnpm add <package-name> --filter @troott/ui
pnpm add <package-name> --filter @troott/api-client
```

### Adding a Dev Dependency

```bash
pnpm add -D <package-name> --filter @troott/web
```

### Adding a Root Dependency

To add a dependency at the root level (shared across all packages):

```bash
pnpm add <package-name> -w
```

### Adding a Dependency to Multiple Packages

You can add to multiple packages at once:

```bash
pnpm add <package-name> --filter @troott/website --filter @troott/web
```

### Using Workspace Packages

To use a workspace package in another package, reference it in `package.json`:

```json
{
    "dependencies": {
        "@troott/ui": "workspace:*",
        "@troott/api-client": "workspace:*"
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
node --version   # Should be >= 22
pnpm --version   # Should be >= 10.33.0
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

1. **Config packages** build first when they define build scripts:

- `@troott/configs-typescript` – shared TS configs (consumed via `extends`, usually no build)
- `@troott/configs/eslint` – shared ESLint config (no build)

2. **Shared libraries** (examples):

- `@troott/ui`, `@troott/api-client`, `@troott/tokens`, `@troott/native-ui` – build only if their `package.json` defines `build`

3. **Applications** build last (depend on packages):

- `@troott/website` - Next.js site
- `@troott/web` - Vite/React SPA
- `@troott/api` - API server
- `@troott/mobile` - Expo app

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

**Note**: Many workspace packages ship TypeScript source only; whether they run a `build` script depends on the individual package.

#### Step 5: Build Specific Application

Build a specific application and its dependencies:

```bash
# Build Next.js website
pnpm build --filter @troott/website

# Build Vite/React SPA
pnpm build --filter @troott/web

# Build API server
pnpm build --filter @troott/api

# Build Expo app
pnpm build --filter @troott/mobile
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

##### @troott/website (Next.js Application)

- **Package**: `apps/website/package.json`
- **Build Script**: `next build` (standalone output for Docker)
- **Output**: `.next/` directory
- **Dev**: port **3051**; Docker/`next start` uses **3000**
- **Docker**: `apps/website/Dockerfile` — standalone Node server, exposes **3000**
- **Build-time env**: `NEXT_PUBLIC_APP_API_URL`, `NEXT_PUBLIC_APP_ENVIRONMENT`

##### @troott/api (API Server)

- **Package**: `apps/api/package.json`
- **Build Script**: `tsc` compile + copy `_data/` and `views/` into `dist/`
- **Output**: `dist/` directory (compiled JavaScript)
- **Runtime**: `node dist/server.js` (default **`PORT=5025`** locally)
- **Docker**: `apps/api/Dockerfile` — Node 22 + ffmpeg, exposes **5025**

##### @troott/web (Vite/React SPA)

- **Package**: `apps/web/package.json`
- **Build Script**: `vite build`
- **Output**: `dist/` directory (optimized production build)
- **Dev**: port **5053**; preview/`start` defaults to **5053** via `PORT`
- **Docker**: `apps/web/Dockerfile` — nginx static, exposes **8080**
- **Build-time env**: `VITE_APP_API_URL`, `VITE_APP_ENVIRONMENT`, observability keys

#### Shared packages

Workspace libraries live under `packages/*`. Each has its own `package.json`; use `pnpm build --filter <name>` when a package defines a `build` script.

Examples:

- `@troott/ui` — `packages/ui`
- `@troott/api-client` — `packages/api-client`
- `@troott/tokens` — `packages/tokens`
- `@troott/native-ui` — `packages/native-ui`

#### Config packages

- `@troott/configs-typescript` — `configs/typescript` (JSON TS configs; consumed via `extends`)
- `@troott/configs/eslint` — `configs/eslint` (ESLint flat config entrypoints)

### Build Output Locations

After building, outputs are located in:

```
troott/
├── apps/
│   ├── website/.next/       # Next.js (when built)
│   ├── web/dist/            # Vite production build
│   ├── api/dist/            # API compile output
│   └── mobile/              # Expo; outputs depend on build profile
└── packages/                # Per-package outputs only if `build` is defined
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

- `**dependsOn: ["^build"]**`: Ensures workspace dependencies build first
- `**inputs**`: Files that trigger rebuilds (includes `.env*` files)
- `**outputs**`: Build output directories to cache

### Build Verification

After building, verify the builds:

```bash
ls apps/website/.next
ls apps/web/dist
ls apps/api/dist
```

### Troubleshooting Build Issues

#### Issue: "Cannot find module '@troott/ui'"

**Solution**: Ensure packages are built or are available as workspace dependencies:

```bash
pnpm install  # Reinstall dependencies
pnpm build --filter './packages/*'  # Build packages explicitly
```

#### Issue: Build cache issues

**Solution**: Clear Turborepo cache:

```bash
pnpm build --force
# Or
turbo run build --force
```

#### Issue: Environment variables not found

**Solution**: Copy sample env files (see [Environment setup](#environment-setup)):

```bash
cp apps/api/example.env apps/api/.env
cp apps/web/.env.sample apps/web/.env
cp apps/website/.env.sample apps/website/.env
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
        "@troott/ui": "workspace:*",
        "@troott/api-client": "workspace:*"
    }
}
```

### Build Scripts Reference

#### Root Scripts

- `pnpm build` - Build all packages and applications
- `pnpm build --filter <package>` - Build specific package/app and dependencies
- `pnpm build --filter './packages/*'` - Build all packages

#### Application-Specific Builds

- `pnpm build --filter @troott/website` - Build Next.js website
- `pnpm build --filter @troott/web` - Build Vite/React SPA
- `pnpm build --filter @troott/api` - Build API server
- `pnpm build --filter @troott/mobile` - Build Expo app

## Deployment

Deploy each app independently. CI/CD is defined in [`.github/workflows/`](.github/workflows/) (see [`.github/README.md`](.github/README.md) for secrets and variables).

| App | Domain (prod) | Container port | Dockerfile |
| --- | ------------- | -------------- | ---------- |
| API | api.troott.com | 5025 | `apps/api/Dockerfile` |
| Studio web | app.troott.com | 8080 | `apps/web/Dockerfile` |
| Marketing | troott.com | 3000 | `apps/website/Dockerfile` |
| Mobile | App stores | — | EAS (`mobile-eas.yml`) |

### Docker (from repo root)

```bash
# API — set PORT=5025 in Coolify runtime env
docker build -f apps/api/Dockerfile -t troott-api .

# Studio web — bake API URL at build time
docker build -f apps/web/Dockerfile -t troott-web \
  --build-arg VITE_APP_API_URL=https://api.troott.com \
  --build-arg VITE_APP_ENVIRONMENT=prod .

# Marketing site
docker build -f apps/website/Dockerfile -t troott-website \
  --build-arg NEXT_PUBLIC_APP_API_URL=https://api.troott.com \
  --build-arg NEXT_PUBLIC_APP_ENVIRONMENT=production .
```

Coolify triggers deploys via GitHub Actions (`deploy.yml`). Runtime secrets (MongoDB, JWT, AWS, MailerLite) belong in Coolify — not in the repo.

---

## Scripts Reference

### Root Scripts

| Script                                                            | Description                          |
| ----------------------------------------------------------------- | ------------------------------------ |
| `pnpm dev`                                                        | All workspace `dev` tasks (Turbo UI) |
| `pnpm dev:fe`                                                     | `apps/website` + `apps/web`          |
| `pnpm dev:website`                                                | Next.js site                         |
| `pnpm dev:web`                                                    | Vite app                             |
| `pnpm dev:api`                                                    | API                                  |
| `pnpm dev:mobile`                                                 | Expo                                 |
| `pnpm build`                                                      | All workspace `build` tasks          |
| `pnpm build:fe`                                                   | Website + Vite app builds            |
| `pnpm build:website` / `build:web` / `build:api` / `build:mobile` | Single app                           |
| `pnpm build:ci` | CI/deploy build (api + web + website) |
| `pnpm lint` | Lint api + web + website |
| `pnpm typecheck:workspace` / `typecheck:api` | Typecheck |
| `pnpm test`                                                       | Tests                                |
| `pnpm expo:mobile` / `expo:mobile:start`                          | Expo CLI via workspace               |
| `pnpm android` / `ios` / `start:mobile`                           | Mobile shortcuts                     |
| `pnpm prebuild:mobile` / `prebuild:mobile:clean`                  | Expo prebuild                        |

### Package-Specific Scripts

Each app/package may have its own scripts. Check individual `package.json` files for details.

---

## Contributing

We welcome contributions! Here's how you can help:

### 1. Fork and Clone

```bash
git clone https://github.com/thetroott/troott.git
cd troott
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

Before committing, run whatever your change touches (for example):

```bash
pnpm lint
pnpm test
pnpm build
```

### 6. Commit Your Changes

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

| Type       | Description                                        |
| ---------- | -------------------------------------------------- |
| `feat`     | New feature                                        |
| `fix`      | Bug fix                                            |
| `chore`    | Maintenance, configs, dependencies                 |
| `refactor` | Code change that does not add features or fix bugs |
| `docs`     | Documentation only                                 |
| `test`     | Tests only                                         |
| `style`    | Formatting, no logic change                        |
| `perf`     | Performance improvement                            |
| `ci`       | CI or pipeline changes                             |
| `build`    | Build system or dependencies                       |

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
- **Workspace Packages**: Use workspace protocol (`workspace:`\*) for internal dependencies

### Project-Specific Guidelines

- **UI Components**: Prefer `@troott/ui` (web) or `@troott/native-ui` (mobile)
- **Shared Logic**: Prefer `@troott/api-client` for cross-app client utilities
- **API Changes**: Document in `apps/api` or your API docs as appropriate
- **Environment Variables**: Use `.env` files (they're gitignored)

### Pull Request Guidelines

- PRs should target the `staging` branch (not `master`)
- Reference issues using `Closes #issue-number` in the PR description
- Add context and screenshots/logs when helpful
- Request reviewers before merging

---

## Additional Resources

### Documentation

Further notes may live under [`docs/`](docs/) (Docker, Coolify, CI, workflow, etc.).

### External Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
