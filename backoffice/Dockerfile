FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build for production using Vite
RUN npm run build-prod

# Install serve to serve the built files
RUN npm install -g serve

# Expose port for the application
EXPOSE 80

# Command to serve the built application
CMD ["serve", "-s", "dist", "-l", "80"] 