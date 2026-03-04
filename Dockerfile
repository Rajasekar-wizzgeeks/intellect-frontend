FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY .env .env

EXPOSE 6104

CMD ["npm", "start"]
