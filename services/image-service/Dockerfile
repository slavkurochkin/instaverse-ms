FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy service files
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5005

CMD ["npm", "start"]

