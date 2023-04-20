#!/bin/bash

curl https://images.linuxcontainers.org/streams/v1/images.json | jq -c . > public/assets/data/linuxcontainers-images.json

curl http://cloud-images.ubuntu.com/releases/streams/v1/com.ubuntu.cloud:released:download.json | jq -c . > public/assets/data/canonical-images.json
