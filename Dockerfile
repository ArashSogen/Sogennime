# Multi-stage Dockerfile for Sogenime Anime Hub
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json vite.config.ts index.html ./
RUN npm install --legacy-peer-deps

COPY src/ ./src/
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8070

COPY package*.json ./
# Install production dependencies + tsx runtime for TypeScript server
RUN npm install --omit=dev --legacy-peer-deps && npm install tsx --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY firebase-applet-config.json ./

EXPOSE 8070

CMD ["npx", "tsx", "server.ts"]
