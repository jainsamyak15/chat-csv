FROM node:20-slim

WORKDIR /app

# Install dependencies and required packages for Prisma
RUN apt-get update && apt-get install -y openssl

# Copy package files first for better caching
COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create .env file with required environment variables
RUN echo "DATABASE_URL=file:/app/prisma/data.db" > .env && \
    echo "REDIS_URL=redis://redis:6379" >> .env && \
    echo "OLLAMA_API_URL=http://host.docker.internal:11434" >> .env && \
    echo "OLLAMA_MODEL=llama2" >> .env && \
    mkdir -p prisma

# Initialize database - force the schema creation
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application with database initialization
CMD npx prisma db push --force-reset && npm start 