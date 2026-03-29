FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci && chown -R node:node /app

FROM base AS source
COPY --chmod=444 index.html ./
COPY --chmod=444 vite.config.ts ./
COPY --chmod=444 tsconfig.json ./
COPY --chmod=444 tsconfig.app.json ./
COPY --chmod=444 tsconfig.base.json ./
COPY --chmod=444 tsconfig.node.json ./
COPY --chmod=444 eslint.config.js ./
COPY --chmod=555 public ./public
COPY --chmod=555 src ./src

FROM source AS dev
USER node
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM source AS build
USER node
RUN npm run build

FROM base AS preview
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
