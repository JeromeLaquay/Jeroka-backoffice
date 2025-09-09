FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN npm install -g @vue/cli

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build for production
RUN npm run build

# Expose port for the application
EXPOSE 8090

# Command to run the application
CMD ["npm", "run", "serve"] 