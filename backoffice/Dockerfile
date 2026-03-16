# Étape de build (inchangée)
FROM node:20-alpine AS build
...
RUN npm run build-prod

# Runtime : nginx au lieu de serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80