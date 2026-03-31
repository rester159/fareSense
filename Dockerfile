# Stage 1: build web app (same app that will run in native shell later)
FROM node:20-alpine AS web
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build:web
RUN sed -i "s/\\.js\" defer/.js?v=$(date +%s)\" defer/" /build/dist/index.html
# → /build/dist/

# Stage 2: backend + serve web build at /
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=web /build/dist /frontend/dist
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "index.js"]
