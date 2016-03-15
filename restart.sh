#!/bin/bash

SSH_SERVER=$1
BRANCH=$2

if [ -z "$SSH_SERVER" ] || [ -z "$BRANCH" ]; then
  echo "Usage: $0 <ssh_url> <branch>"
  exit 1
fi

if [ "$BRANCH" = "master" ]; then
  REPO_PATH="/home/ubuntu/git/koodaindist"
else
  # Branch: develop
  REPO_PATH="/home/ubuntu/git/koodaindist-dev"
fi

# Update the remote repo, kill previous instance and launch again.
ssh "$SSH_SERVER" "bash -s" <<EOF
cd $REPO_PATH
git pull
bash scripts/kill_process_listening_to_port.sh 8081
bash scripts/launch-dev.sh
echo "Restarted"
EOF
