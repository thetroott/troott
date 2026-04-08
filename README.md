

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
- [Project Structure](#project-structure)
- [Development](#development)
- [Adding Dependencies](#adding-dependencies)
- [Building](#building)
- [Deployment](#deployment)
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
git clone https://github.com/thetroott/troott.git
cd troott
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
troott/
├── apps/              # Applications
│   ├── website/      # Next.js site (@troott/website)
│   ├── web/          # Vite/React SPA (@troott/web)
│   ├── api/          # API server (@troott/api)
│   └── mobile/       # Expo app (@troott/mobile)
├── packages/          # Shared packages
│   ├── ui/           # Web UI primitives (@troott/ui)
│   ├── sdk/          # Shared SDK (@troott/sdk)
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
  - `@troott/sdk` - Shared client utilities and hooks
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

### Development URLs

Ports depend on each app’s config. Typical local defaults:

- **Vite web** (`apps/web`): see Vite dev server output (often port **5176**).
- **Website** (`apps/website`): often **3020** when using `next dev` defaults.
- **API** (`apps/api`): see `PORT` / server logs (often **5015** in this repo).
- **Mobile** (`apps/mobile`): Expo dev server (see terminal after `pnpm dev:mobile`).

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
pnpm add <package-name> --filter @troott/sdk
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
    "@troott/sdk": "workspace:*"
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

1. **Config packages** build first when they define build scripts:
  - `@troott/configs-typescript` – shared TS configs (consumed via `extends`, usually no build)
  - `@troott/configs/eslint` – shared ESLint config (no build)
2. **Shared libraries** (examples):
  - `@troott/ui`, `@troott/sdk`, `@troott/tokens`, `@troott/native-ui` – build only if their `package.json` defines `build`
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
- **Build Script**: `next build`
- **Output**: `.next/` directory (Next.js production build)
- **Dependencies**: (see app `package.json`)
- **Build Details**:
  - Compiles Next.js application
  - Generates optimized production bundle
  - Outputs static pages where applicable
  - Creates server-side rendering artifacts

##### @troott/api (API Server)

- **Package**: `apps/api/package.json`
- **Build Script**: `tsc --noEmit false && tsc-alias && copyfiles -u 1 src/_data/**/* dist/ && copyfiles -u 1 src/views/**/* dist/`
- **Output**: `dist/` directory (compiled JavaScript)
- **Dependencies**: see `apps/api/package.json` (often `@troott/configs-typescript` as a dev tool)
- **Build Details**:
  1. Compiles TypeScript to JavaScript (`tsc`)
  2. Resolves TypeScript path aliases (`tsc-alias`)
  3. Copies static files from `src/_data/` to `dist/`
  4. Copies template files from `src/views/` to `dist/`
  - Environment variable `PORT` affects build (configured in `turbo.json`)

##### @troott/web (Vite/React SPA)

- **Package**: `apps/web/package.json`
- **Build Script**: `tsc -b && vite build`
- **Output**: `dist/` directory (optimized production build)
- **Dependencies**: (see `apps/web/package.json`)
- **Build Details**:
  1. Type-checks and compiles TypeScript (`tsc -b`)
  2. Builds production bundle with Vite
  3. Generates optimized static assets
  - Uses Vite for fast builds and code splitting

#### Shared packages

Workspace libraries live under `packages/*`. Each has its own `package.json`; use `pnpm build --filter <name>` when a package defines a `build` script.

Examples:

- `@troott/ui` — `packages/ui`
- `@troott/sdk` — `packages/sdk`
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
    "@troott/ui": "workspace:*",
    "@troott/sdk": "workspace:*"
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

This monorepo does not ship a single container layout under `apps/*`. Deploy each application with the workflow that matches it (hosting provider, EAS for Expo, your API runtime, etc.). Optional notes may exist under [`docs/`](docs/).

---

## Scripts Reference

### Root Scripts


| Script | Description |
| ------ | ----------- |
| `pnpm dev` | All workspace `dev` tasks (Turbo UI) |
| `pnpm dev:fe` | `apps/website` + `apps/web` |
| `pnpm dev:website` | Next.js site |
| `pnpm dev:web` | Vite app |
| `pnpm dev:api` | API |
| `pnpm dev:mobile` | Expo |
| `pnpm build` | All workspace `build` tasks |
| `pnpm build:fe` | Website + Vite app builds |
| `pnpm build:website` / `build:web` / `build:api` / `build:mobile` | Single app |
| `pnpm lint` | Lint |
| `pnpm test` | Tests |
| `pnpm expo:mobile` / `expo:mobile:start` | Expo CLI via workspace |
| `pnpm android` / `ios` / `start:mobile` | Mobile shortcuts |
| `pnpm prebuild:mobile` / `prebuild:mobile:clean` | Expo prebuild |


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
- **Workspace Packages**: Use workspace protocol (`workspace:`*) for internal dependencies

### Project-Specific Guidelines

- **UI Components**: Prefer `@troott/ui` (web) or `@troott/native-ui` (mobile)
- **Shared Logic**: Prefer `@troott/sdk` for cross-app client utilities
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