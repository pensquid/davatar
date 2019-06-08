FROM node:8

WORKDIR /opt/davatar

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
EXPOSE 3000
CMD [ "node", "index.js" ]