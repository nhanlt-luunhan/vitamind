FROM node:20-alpine AS base
RUN apk upgrade --no-cache

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN if [ -f .env.docker ]; then cp .env.docker .env.production; fi; \
    npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat postgresql-client && \
    addgroup -S nodejs && \
    adduser -S nextjs -G nodejs && \
    rm -rf /usr/local/lib/node_modules/npm && \
    rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/docker/db-init ./docker/db-init
RUN chmod +x /app/scripts/docker-entrypoint.sh && \
    mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3333
ENV PORT=3333
ENV HOSTNAME=0.0.0.0
ENV AUTO_DB_SYNC=false
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["node","-e","fetch('http://127.0.0.1:3333/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["/app/scripts/docker-entrypoint.sh"]
