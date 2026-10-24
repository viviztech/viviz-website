FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

FROM dependencies AS builder
# These values are public and Next.js embeds them during compilation.
ARG NEXT_PUBLIC_BASE_URL=https://viviz.in
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
COPY . .
# Database configuration and migrations belong to deployment runtime, not this build.
# Bound the build's Node heap on the shared host; runtime has independent limits.
RUN NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=2" npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# Standalone output contains Next.js and its traced server/PDF dependencies.
# Public images are also read directly by invoice and offer-letter PDF rendering.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || '3000') + '/api/health', { signal: AbortSignal.timeout(3000) }).then(response => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"]
CMD ["node", "server.js"]
