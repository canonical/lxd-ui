# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:20 AS yarn-dependencies

WORKDIR /srv

ADD . .
RUN yarn config set httpProxy $HTTP_PROXY
RUN yarn config set httpsProxy $HTTPS_PROXY
RUN yarn install
RUN yarn run build-demo

ENTRYPOINT ["./entrypoint"]
