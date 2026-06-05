# Production API image: Node 22 + system ffmpeg (HLS packaging).
# Build from monorepo root:
#   docker build -f apps/api/Dockerfile -t troott-api .

FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && ffmpeg -version

WORKDIR /app

FROM base AS deps

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY configs ./configs
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --filter @troott/api...

FROM base AS build

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY configs ./configs
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app/apps/api

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/api/node_modules ./node_modules

ENV PORT=5025
EXPOSE 5025

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${APP_PORT:-5025}/api/v1/me || exit 1


CMD ["node", "dist/server.js"]
