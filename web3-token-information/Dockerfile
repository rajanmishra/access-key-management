# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port that your app runs on
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
