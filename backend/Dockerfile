# Use Node.js LTS (Alpine for smaller footprint)
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Ensure non-root user execution for security
USER node

# Expose API port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
