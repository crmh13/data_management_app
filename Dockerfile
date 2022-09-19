FROM node:16.0.0-alpine

WORKDIR /app

RUN apk update && \
    apk add tzdata &&\
    npm update -g npm &&\
    yarn install --immutable --immutable-cache --check-cache