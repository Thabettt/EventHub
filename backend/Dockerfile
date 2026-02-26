# Use Node.js LTS (Alpine for smaller footprint)
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package configurations first to leverage Docker layer caching
# (Reinstalls deps only when package files change, not on every code change)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Ensure non-root user execution for security
USER node

# Expose API port
EXPOSE 3003

# Start server
CMD ["npm", "start"]
