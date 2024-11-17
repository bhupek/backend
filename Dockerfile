FROM node:18-slim

WORKDIR /app

# Install build dependencies using apt-get instead of apk
RUN apt-get update && \
    apt-get install -y \
    python3 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000

# Use development command
CMD ["npm", "run", "dev"] 