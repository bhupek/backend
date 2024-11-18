# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Update certificates and install build dependencies
RUN apk update --no-cache && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates && \
    apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json ./

# Install dependencies with npm configuration to handle SSL issues
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm cache clean --force && \
    npm install

# Copy application files
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]