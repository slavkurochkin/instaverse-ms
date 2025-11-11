FROM node:18-alpine

WORKDIR /app

# Copy shared library first
COPY services/shared /app/services/shared
WORKDIR /app/services/shared
RUN npm install --production

# Copy service files
COPY services/api-gateway/package*.json /app/services/api-gateway/
WORKDIR /app/services/api-gateway
RUN npm install --production

COPY services/api-gateway/ /app/services/api-gateway/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]

