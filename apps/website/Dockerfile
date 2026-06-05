# Production marketing site (Next.js 15).
# Build from monorepo root:
#   docker build -f apps/website/Dockerfile -t troott-website \
#     --build-arg NEXT_PUBLIC_APP_API_URL=https://api.troott.com .

FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY configs ./configs
COPY apps/website/package.json apps/website/

RUN pnpm install --frozen-lockfile --filter @troott/website...

FROM base AS build

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/website/node_modules ./apps/website/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY configs ./configs
COPY apps/website ./apps/website

WORKDIR /app/apps/website

ARG NEXT_PUBLIC_APP_API_URL
ARG NEXT_PUBLIC_APP_ENVIRONMENT=production
ENV NEXT_PUBLIC_APP_API_URL=$NEXT_PUBLIC_APP_API_URL \
    NEXT_PUBLIC_APP_ENVIRONMENT=$NEXT_PUBLIC_APP_ENVIRONMENT \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=build /app/apps/website/public ./apps/website/public
COPY --from=build /app/apps/website/.next/standalone ./
COPY --from=build /app/apps/website/.next/static ./apps/website/.next/static

EXPOSE 3000

CMD ["node", "apps/website/server.js"]
