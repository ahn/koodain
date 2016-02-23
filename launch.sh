#!/bin/bash

PORT=8080 NODE_ENV=production npm start 2> logi-err.log > logi.log &
