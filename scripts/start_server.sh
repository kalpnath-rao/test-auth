#!/bin/bash
pm2 delete all

npm run prebuild

npm run build

pm2 start ecosystem.config.js
