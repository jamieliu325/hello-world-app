# Use Node.js LTS
FROM node:20

WORKDIR /app

# Copy backend package files and install deps
COPY package*.json ./
RUN npm install

# Copy backend code
COPY . .

# Expose port
EXPOSE 8000

# Start backend server
CMD ["node", "index.js"]