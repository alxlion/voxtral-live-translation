FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server.mjs ws-handler.mjs ./
ENV HOST=0.0.0.0
ENV PORT=4003
EXPOSE 4003
CMD ["node", "server.mjs"]
