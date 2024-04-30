# Dockerfile
FROM node:latest

RUN npm install -g pm2

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "app.js"]

VOLUME ["/app/public/uploads"]