# syntax=docker/dockerfile:1

FROM node:20.11-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM deps AS build
COPY . .
RUN npm run build:docs

FROM nginx:1.27-alpine AS prod
# Next export uses basePath '/clover-iiif' in non-dev builds, so serve files under that path.
COPY --from=build /app/out /usr/share/nginx/html/clover-iiif
EXPOSE 80

