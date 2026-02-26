# ─── Stage 1: Build ────────────────────────────────────────────────────────────
# Use full Node to build the React app
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install ALL dependencies (including dev — needed to build)
COPY package*.json ./
RUN npm ci

# Copy source code and build the production bundle
COPY . .

# Build-time env args come in here. Pass them via docker-compose build args.
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_STRIPE_PUBLIC_KEY

# Vite reads these at BUILD TIME — not runtime — so they must be passed at build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

RUN npm run build
# Output: /usr/src/app/dist — a folder of static HTML, CSS, and JS files

# ─── Stage 2: Serve ────────────────────────────────────────────────────────────
# Use Nginx — a battle-hardened static file server — to serve the built assets
# The full builder image (~500MB) is discarded; only the /dist folder survives
FROM nginx:alpine

# Remove default Nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy our built React app into Nginx's web root
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy our custom Nginx config (handles React client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx serves on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
