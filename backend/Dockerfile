# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install the dependencies
RUN npm install

# Globally install nodemon to allow automatic server restarts on file changes
RUN npm install -g nodemon

# Copy the source code to the container
COPY src/ ./src

# Expose port 5000 (since your app runs on this port)
EXPOSE 5000

# Start the application with nodemon to enable hot-reloading
CMD ["nodemon", "src/index.js"]
