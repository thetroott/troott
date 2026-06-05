# Production studio web (Vite SPA).
# Build from monorepo root:
#   docker build -f apps/web/Dockerfile -t troott-web \
#     --build-arg VITE_APP_API_URL=https://api.troott.com .

FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile --filter @troott/web...

FROM base AS build

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web

WORKDIR /app/apps/web

ARG VITE_APP_API_URL
ARG VITE_APP_ENVIRONMENT=prod
ARG VITE_APP_PUBLIC_SENTRY_DSN
ARG VITE_APP_PUBLIC_POSTHOG_KEY
ARG VITE_APP_PUBLIC_POSTHOG_HOST
ARG VITE_DEPLOYMENT_REGION

ENV VITE_APP_API_URL=$VITE_APP_API_URL \
    VITE_APP_ENVIRONMENT=$VITE_APP_ENVIRONMENT \
    VITE_APP_PUBLIC_SENTRY_DSN=$VITE_APP_PUBLIC_SENTRY_DSN \
    VITE_APP_PUBLIC_POSTHOG_KEY=$VITE_APP_PUBLIC_POSTHOG_KEY \
    VITE_APP_PUBLIC_POSTHOG_HOST=$VITE_APP_PUBLIC_POSTHOG_HOST \
    VITE_DEPLOYMENT_REGION=$VITE_DEPLOYMENT_REGION

RUN pnpm build

FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
