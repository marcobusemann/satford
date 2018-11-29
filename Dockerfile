FROM node

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
RUN npm install --production

COPY dist /app/

CMD [ "node", "/app/server.js" ]