FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Create data directory for persistent storage
RUN mkdir -p /data

ENV DB_PATH=/data/linguaverse.db
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start"]