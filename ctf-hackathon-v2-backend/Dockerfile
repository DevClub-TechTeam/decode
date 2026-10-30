FROM oven/bun:1.4.4 AS base

#

FROM base AS frontend
WORKDIR /frontend

COPY ctf-hackathon-v2/package.json ctf-hackathon-v2/bun.lock ./

RUN bun install --frozen-lockfile

COPY ctf-hackathon-v2/ ./

RUN bun run build

#

FROM base AS backend
WORKDIR /app

COPY ctf-hackathon-v2-backend/package.json ./
COPY ctf-hackathon-v2-backend/bun.lock ./

RUN bun install --frozen-lockfile --production

#

FROM base as production
WORKDIR /app

COPY --from=backend /app/node_modules ./node_modules

COPY ctf-hackathon-v2-backend/ ./

# Copy compiled Vue frontend into backend
COPY --from=frontend /frontend/dist ./public

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
USER bun
CMD ["bun", "run", "index.ts"]
