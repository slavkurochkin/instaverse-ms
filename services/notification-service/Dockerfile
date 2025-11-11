FROM node:18-alpine

WORKDIR /app

# Copy shared library first
COPY services/shared /app/services/shared
WORKDIR /app/services/shared
RUN npm install --production

# Copy service files
COPY services/notification-service/package*.json /app/services/notification-service/
WORKDIR /app/services/notification-service
RUN npm install --production

COPY services/notification-service/ /app/services/notification-service/

EXPOSE 5004 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5004/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]

