FROM node:22-alpine AS builder
WORKDIR /app
ENV REDISMS_DISABLE_POSTINSTALL=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 80
CMD ["node", "dist/server.js"]
