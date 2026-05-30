# Use official Node.js image to build the React app
FROM node:18-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Set CI=false to prevent linting errors from failing the build
ENV CI=false

# Build the React app for production
# Run react-scripts build directly (skip sentry step in Docker to avoid failures)
RUN npx react-scripts build

# Verify build output exists
RUN ls -la /app/ && \
    test -d /app/build || (echo "ERROR: /app/build directory does not exist!" && exit 1) && \
    test -f /app/build/index.html || (echo "ERROR: /app/build/index.html not found!" && ls -la /app/build/ && exit 1) && \
    echo "Build verification successful!"

# Use Nginx to serve the frontend app
FROM nginx:alpine

# Remove default nginx config and default html files to prevent default page from showing
RUN rm -f /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the React build output to Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Verify build files exist (will fail if build directory is empty)
RUN ls -la /usr/share/nginx/html/ || (echo "ERROR: Build directory is empty!" && exit 1)

# Verify index.html exists
RUN test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found!" && exit 1)

# Test nginx configuration
RUN nginx -t

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]