# Use Docker's buildkit syntax
# Multi-stage build for production Next.js app
FROM node:20.9.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install full dependencies (including dev) so the build step has Tailwind/PostCSS
RUN npm ci

FROM node:20.9.0-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20.9.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
