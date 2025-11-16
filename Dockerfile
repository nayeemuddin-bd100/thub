# TravelHub - Production Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
# Don't set NODE_ENV=production here as it skips devDependencies
RUN npm ci && npm cache clean --force

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (we need tsx to run drop-tables.ts)
RUN npm ci && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY shared ./shared
COPY server ./server
COPY client ./client
COPY drizzle.config.ts ./drizzle.config.ts
COPY tsconfig.json ./tsconfig.json
COPY start.sh ./start.sh

# Make startup script executable
RUN chmod +x /app/start.sh

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/api/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with database initialization
CMD ["/app/start.sh"]
