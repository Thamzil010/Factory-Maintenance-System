FROM node:18-bullseye-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build the frontend
RUN npm run build

# Start dev server for local dev or serve static files in production
# For simplicity in this dev/demo environment, we'll run Vite's preview server or dev server
EXPOSE 3000

CMD ["npm", "run", "dev"]
