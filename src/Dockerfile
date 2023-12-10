FROM node:18

EXPOSE 3000

WORKDIR /app

COPY . .

RUN rm -rf node_modules package-lock.json
RUN npm install

CMD ["node", "index.js"]