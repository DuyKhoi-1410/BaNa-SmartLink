# ===== Backend: Node + tsx (chay TS truc tiep, khong build) =====
# Dung node 22 LTS: prebuilt binary cho bcrypt/sharp day du nhat.

# --- Stage 1: cai dependencies (co build tool du phong cho bcrypt/sharp) ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app
# build-essential + python3: du phong khi bcrypt/sharp khong co prebuilt cho platform
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: runtime gon ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# node_modules da build san (gom tsx trong devDeps de chay src/index.ts)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
# Thu muc uploads BE serve tinh (/app/uploads) — se mount volume de giu du lieu
RUN mkdir -p uploads
EXPOSE 3636
CMD ["npm", "run", "start"]
