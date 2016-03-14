#!/bin/bash

DEFAULT_REMOTE_PATH="/home/ubuntu/git/koodaindist.git"

if [ ! -f Gruntfile.js ]; then
  echo "This script must be run at the project root!"
  exit 1
fi

SSH_SERVER=$1
BRANCH=$2
REMOTE_PATH=$3

if [ -z "$SSH_SERVER" ] || [ -z "$BRANCH" ]; then
  echo "Usage: $0 <ssh_url> <branch> [remote_path]"
  echo
  echo "branch must be either develop or master"
  echo
  echo "Example: $0 openstack4 develop"
  exit 1
fi

# Test that branch exists
if [ -z "$(git branch --list $BRANCH)" ]; then
  echo "Branch $BRANCH does not exist!"
  exit 1
fi

# Test SSH connection
ssh $SSH_SERVER 'echo hello'
if [ $? -ne 0 ]; then
  echo "Could not connect to $SSH_SERVER"
  exit 1
fi

REMOTE_PATH="$3"
if [ -z "$REMOTE_PATH" ]; then
  REMOTE_PATH="$DEFAULT_REMOTE_PATH"
  echo "Using default remote path $REMOTE_PATH"
fi

REMOTE_URL="ssh://${SSH_SERVER}${REMOTE_PATH}"
REMOTE_NAME=origin

git checkout $BRANCH
COMMIT=$(git rev-parse HEAD)


# Making sure that...

# 1) dist directory exists,
mkdir -p dist

# 2) it's a git repository,
cd dist
git init

# 3) has remote set,
if [ -z $(git remote | grep "^$REMOTE_NAME$" ) ]; then
  git remote add $REMOTE_NAME $REMOTE_URL
fi

# 4) with the content fetched from remote,
git fetch $REMOTE_NAME
if [ $? -ne 0 ]; then
  echo "Could not fetch $REMOTE_URL"
  cd ..
  exit 1
fi

# 5) and the proper branch is checked out
git checkout $BRANCH || git checkout -b $BRANCH --track $REMOTE_NAME/$BRANCH


# Back to project root
cd ..

# Build the project
grunt build

# Commit the built app
cd dist
git add --all .
git commit -m "Build for $COMMIT"

# and push it
git push $REMOTE_NAME $BRANCH:$BRANCH
cd ..

# Finally, restart the server
./restart.sh $SSH_SERVER $BRANCH


