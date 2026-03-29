FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci && chown -R node:node /app

FROM base AS source
COPY --chown=node:node index.html ./
COPY --chown=node:node vite.config.ts ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node tsconfig.app.json ./
COPY --chown=node:node tsconfig.base.json ./
COPY --chown=node:node tsconfig.node.json ./
COPY --chown=node:node eslint.config.js ./
COPY --chown=node:node public ./public
COPY --chown=node:node src ./src

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
