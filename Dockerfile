FROM --platform=linux/arm64/v8 node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Initialize database
RUN mkdir -p prisma && \
    npx prisma generate && \
    npx prisma db push --force-reset

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"] 