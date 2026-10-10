FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend

RUN npm ci

COPY frontend/ ./

RUN npm run build

FROM nginx:alpine AS runner

RUN rm -rf /etc/nginx/conf.d/*

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
