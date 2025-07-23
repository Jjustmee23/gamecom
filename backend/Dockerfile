FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

        # Install dependencies (including dev dependencies for build)
    RUN npm install

    # Copy source code
    COPY . .

    # Skip build for now - run in development mode
    # RUN npm run build
    # RUN npm prune --only=production

# Expose port
EXPOSE 3001

# Start the application in development mode
CMD ["npm", "run", "dev"] 