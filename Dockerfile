# Stage 1: Builder for Node.js dependencies and React client build
# Use a specific Node.js version for stability. node:20-alpine is the current LTS.
FROM node:20-alpine AS builder

# Set the working directory for the application
WORKDIR /usr/src/app

# Install build dependencies required for native Node.js modules (like sqlite3)
# --no-cache: reduces image size by not caching package indexes.
# Add git for specific npm/yarn dependencies if needed, otherwise omit.
# You already have python3, make, g++ which are correct for node-gyp.
RUN apk add --no-cache python3 make g++ git

# Copy root package.json and package-lock.json first to leverage Docker layer caching.
# This step only invalidates if package.json or package-lock.json changes.
COPY package*.json ./

# Install server-side production dependencies.
# 'npm ci' is good for reproducible builds.
RUN npm ci --only=production

# Copy client package.json and package-lock.json
COPY client/package*.json ./client/

# Install client-side production dependencies.
# This often doesn't need python/make/g++, but it's fine if they are installed above.
RUN cd client && npm ci --only=production

# Copy the rest of the application source code (server and client src)
COPY . .

# Build the React client application
RUN cd client && npm run build

# Debug: Check what was built
RUN ls -la client/build/
RUN echo "=== Index.html size and content ===" && wc -c client/build/index.html && echo "=== End size ===" && head -c 1000 client/build/index.html && echo "=== End content ==="

# Ensure server/public directory exists and copy built client files into it
RUN mkdir -p server/public && cp -r client/build/. server/public/

# Debug: Check what was copied
RUN ls -la server/public/
RUN echo "=== Copied Index.html size and content ===" && wc -c server/public/index.html && echo "=== End size ===" && head -c 1000 server/public/index.html && echo "=== End content ==="

# Clean up build-time dependencies to reduce image size for the builder stage
# This will not affect the final production image, but it's good practice for intermediate layers.
RUN apk del python3 make g++ git

# --- Stage 2: Production image ---
# Use a lighter Node.js base image for production if possible, or stick to alpine.
# node:20-alpine is still a good choice for production due to its small size.
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /usr/src/app

# Install runtime dependencies for health check (wget)
# You correctly identified wget for the healthcheck.
# If your application needs other specific runtime tools, add them here.
RUN apk add --no-cache wget

# Copy only the necessary package.json files for production dependencies
# This is generally from the root package.json, as client build is already done.
COPY package*.json ./

# Re-installing production dependencies in the production stage is good practice
# for a truly minimal production image that doesn't rely on the builder's node_modules.
# Ensure this step has access to the compiled native modules if they are not copied.
# If sqlite3 is a native module, it was built in the builder stage.
# If 'npm ci --only=production' here tries to re-build it, it will fail without build tools.
# Your current solution (installing build tools in both stages) addresses this.
RUN npm ci --only=production && npm cache clean --force

# Remove build tools from the production image after npm ci, if they were installed.
# This significantly reduces the final image size.
# Use '|| true' to ignore errors if packages were not installed (e.g., if prebuilds were used)
RUN apk del python3 make g++ || true

# Copy server code, configuration, and environment files
COPY server/ ./server/
COPY config.js ./
COPY env-loader.js ./
COPY .env ./

# Copy the built client files from the builder stage
COPY --from=builder /usr/src/app/server/public ./server/public

# Create data directory for SQLite database with proper permissions
# Using --parents creates parent directories as needed.
RUN mkdir -p /usr/src/app/server/data && \
    chmod 755 /usr/src/app/server/data

# Create a dedicated non-root user and group for security
# Using adduser -D (no password, no home dir) for daemon users.
# nodejs user will have UID 1000 by default in Alpine if first non-root.
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Change ownership of the application directory to the non-root user
# This is critical for security and proper application function.
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to the non-root user
USER nodejs

# Expose the port the application listens on
EXPOSE 3020

# Health check to ensure the application is running and responsive
# Using 'curl' is often preferred over 'wget' for health checks in Alpine.
# install curl: RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3020/ || exit 1

# Define the command to run the application
# Use 'node server/index.js' if your package.json 'start' script is complex
# or if you want direct control. Otherwise 'npm start' is fine.
CMD ["npm", "start"]