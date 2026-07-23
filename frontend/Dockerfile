# ===== Frontend: build Vite -> serve bang nginx (kiem luon proxy API) =====

# --- Stage 1: build static ---
FROM node:22-bookworm-slim AS build
WORKDIR /app
# sharp (vite-plugin-image-optimizer) co the can build tool khi thieu prebuilt
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# API goi qua duong dan tuong doi -> nginx cung container proxy sang backend.
# Nho vay chi can lo cong 3000, trinh duyet khong cham truc tiep backend.
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# --- Stage 2: nginx serve + reverse proxy ---
FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
