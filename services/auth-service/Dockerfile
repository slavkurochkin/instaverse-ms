FROM node:18-alpine

WORKDIR /app

# Copy shared library first
COPY services/shared /app/services/shared
WORKDIR /app/services/shared
RUN npm install --production

# Copy service files
COPY services/auth-service/package*.json /app/services/auth-service/
WORKDIR /app/services/auth-service
RUN npm install --production

COPY services/auth-service/ /app/services/auth-service/

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]

