#!/bin/bash

if [ -n "$1" ]; then
  pid=`netstat -tulpn | grep :$1 | awk '{ print $7 }' | awk -F/ '{ print $1 }'`
  if [ -n "$pid" ]; then
    echo "Killing process $pid listening to port $1"
    kill $pid && echo Killed
  else
    echo "No process listening to port $1"
  fi
else
  echo "Usage: $0 <PORT>"
fi
