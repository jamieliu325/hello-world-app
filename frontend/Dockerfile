# Use Node.js LTS
FROM node:20

WORKDIR /app

# Copy frontend package files and install deps
COPY package*.json ./
RUN npm install

# Copy frontend code
COPY . .

# Expose port
EXPOSE 3000

# Start React app
CMD ["npm", "start"]