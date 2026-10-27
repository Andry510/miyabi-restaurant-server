# Production image: compiles in the build stage, applies migrations and starts the server in the runtime stage
FROM node:24.22.1-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm prisma generate \
  && pnpm build

FROM node:24.22.1-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV CHECKPOINT_DISABLE=1
ENV PRISMA_HIDE_UPDATE_MESSAGE=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 3520

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && exec node dist/src/main"]
