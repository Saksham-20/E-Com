# Multi-stage build for production deployment
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Copy client source code (including public directory)
WORKDIR /app
COPY client/ ./client/

# Build the React app
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy server package files
COPY server/package*.json ./

# Install only production dependencies for server
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p /app/uploads/products /app/uploads/users /app/uploads/temp && \
    chown -R nextjs:nodejs /app/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server/index.js"]