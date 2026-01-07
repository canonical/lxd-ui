#!/bin/bash

set -e
set -x

# Ensure that the first argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 origin:branch"
  exit 1
fi

# Split the argument by ':'
IFS=":" read -r origin branch <<< "$1"

# Check if both origin or branch are missing
if [ -z "$origin" ] || [ -z "$branch" ]; then
  echo "Error: The input must be in the format origin:branch"
  exit 1
fi

# Ensure that the real-origin and $origin remotes exist
url=$(git remote get-url origin 2>/dev/null)
if [[ "$url" == https://* ]]; then
  git remote get-url real-origin >/dev/null 2>&1 || \
  git remote add real-origin https://github.com/canonical/lxd-ui.git

  git remote get-url $origin >/dev/null 2>&1 || \
  git remote add $origin https://github.com/$origin/lxd-ui.git
else
  git remote get-url real-origin >/dev/null 2>&1 || \
  git remote add real-origin git@github.com:canonical/lxd-ui.git

  git remote get-url $origin >/dev/null 2>&1 || \
  git remote add $origin git@github.com:$origin/lxd-ui.git
fi

# Pull the latest changes from real-origin main
git checkout main
git pull real-origin main

# Delete the feature branch if it already exists, then create and checkout the branch
if [ `git branch --list $branch` ]
then
  git branch -D $branch
fi
git branch $branch
git checkout $branch
git pull $origin $branch

