# Build js / css
FROM node:21 AS yarn-dependencies
WORKDIR /srv
COPY . .
RUN yarn --network-concurrency 2
# currently vite v5 does not work on big endian systems due to rollup support issues
RUN if [ "$(arch)" = "s390x" ] ; then yarn upgrade vite@4.5.2 ; else echo "we good" ; fi
RUN yarn run build
RUN mkdir /srv/deploy
RUN mv build /srv/deploy/
RUN mv entrypoint /srv/deploy/
RUN mv haproxy-demo.cfg /srv/deploy/

# Build the demo image
FROM ubuntu:jammy

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv
RUN apt-get update && apt-get install -y --no-install-recommends \
        haproxy \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget

# Install serve
ENV NVM_DIR /usr/local/nvm
RUN mkdir /usr/local/nvm \
    && wget --no-check-certificate https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh \
    && bash install.sh \
    && . $NVM_DIR/nvm.sh \
    && nvm install v16 \
    && npm install --global serve

# Import code
COPY --from=yarn-dependencies /srv/deploy /srv

ENTRYPOINT ["./entrypoint"]
