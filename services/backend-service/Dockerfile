# STAGE: build
FROM node:lts-alpine AS builder
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json tsconfig.json ./

RUN npm install

COPY src src

RUN npm run build && rm -rf src tsconfig.json

# STAGE: run
FROM node:lts-alpine as latest
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY --from=builder /usr/app ./

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
