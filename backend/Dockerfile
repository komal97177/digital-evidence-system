# Backend Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    tzdata

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && \
    chown -R node:node /app/uploads

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]