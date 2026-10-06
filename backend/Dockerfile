# -----------------------
# Stage 1: Build
# -----------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and tsconfig
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# -----------------------
# Stage 2: Production Runner
# -----------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy production node_modules and built code
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create non-root user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
