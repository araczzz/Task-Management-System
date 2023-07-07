FROM alpine

WORKDIR /client

RUN apk add npm

COPY package.json .

RUN npm install

COPY . .

CMD ["npm","start"]