#!/bin/bash

if ! jq --version &> /dev/null
then
    echo "jq could not be found, please install it: apt install jq"
    exit
fi


curl http://cloud-images.ubuntu.com/releases/streams/v1/com.ubuntu.cloud:released:download.json | jq -c . > public/assets/data/canonical-images.json

curl https://cloud-images.ubuntu.com/minimal/releases/streams/v1/com.ubuntu.cloud:released:download.json | jq -c . > public/assets/data/canonical-minimal-images.json