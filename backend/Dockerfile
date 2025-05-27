FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

# Copy the rest of the application
COPY . .

# Create Database and uploads directories with proper permissions
RUN mkdir -p /app/Database && chmod 777 /app/Database && \
    mkdir -p /app/public/uploads/profiles && chmod 777 /app/public/uploads/profiles

# Expose the port your app runs on
EXPOSE 3000

# Use nodemon instead of npm start for development
CMD ["npm", "run", "dev"]