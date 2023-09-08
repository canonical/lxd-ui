#!/bin/bash

if ! jq --version &> /dev/null
then
    echo "jq could not be found, please install it: apt install jq"
    exit
fi


curl https://images.linuxcontainers.org/streams/v1/images.json | jq -c . > public/assets/data/linuxcontainers-images.json

curl http://cloud-images.ubuntu.com/releases/streams/v1/com.ubuntu.cloud:released:download.json | jq -c . > public/assets/data/canonical-images.json
