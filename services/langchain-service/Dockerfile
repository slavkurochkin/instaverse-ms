FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY services/langchain-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY services/langchain-service/ /app/

# Copy .env file if it exists (optional, can also use env_file in docker-compose)
# The .env file will be loaded by the application at runtime

# Expose port
EXPOSE 5006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5006/health')"

# Run the application
CMD ["python", "src/main.py"]

