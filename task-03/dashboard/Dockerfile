FROM docker.io/library/node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Incorrect port (will cause issues)
EXPOSE 5000

# Environment variable
ENV API_URL=http://backend:3000/api

CMD ["node", "index.js"]
