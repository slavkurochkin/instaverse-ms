FROM node:18-alpine

WORKDIR /app

# Copy shared library first
COPY services/shared /app/services/shared
WORKDIR /app/services/shared
RUN npm install --production

# Copy service files
COPY services/social-service/package*.json /app/services/social-service/
WORKDIR /app/services/social-service
RUN npm install --production

COPY services/social-service/ /app/services/social-service/

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]

