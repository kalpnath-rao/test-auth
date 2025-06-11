#!/usr/bin/env bash
cd /var/www/html/microservice-rcc/nestjs-accelerator/auth-service
ls -la
pwd
tar -xzf microservicercc_artifact.tar.gz
rm -rf microservicercc_artifact.tar.gz
mv env .env
la -la
pwd 
cat .env 
#pm2 delete nest-auth-service
pm2 restart nest-auth-service
#npm i node-rdkafka
