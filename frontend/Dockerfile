# Use the official Node.js image as a base for React
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the React app with hot-reloading enabled
CMD ["npm", "start", "--", "--host"]
