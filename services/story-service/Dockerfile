FROM node:18-alpine

WORKDIR /app

# Copy shared library first
COPY services/shared /app/services/shared
WORKDIR /app/services/shared
RUN npm install --production

# Copy service files
COPY services/story-service/package*.json /app/services/story-service/
WORKDIR /app/services/story-service
RUN npm install --production

COPY services/story-service/ /app/services/story-service/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]

