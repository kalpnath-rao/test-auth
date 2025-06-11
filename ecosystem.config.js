/* eslint-disable */

const pkg = require('./package.json');
const DotEnv = require('dotenv');
DotEnv.config({
  path: `.env`,
});

module.exports = {
  apps: [
    {
      name: pkg.name,
      version: pkg.version,
      script: 'dist/main.js',
      watch: false,
      instances: 1, //If 0,  PM2 will automatically spawn as many workers as you have CPU cores.
      exec_mode: 'cluster',
      ignore_watch: ['logs', 'logs/*', './node_modules', './.git'],
      env: {
        NODE_ENV: `${process.env.NODE_ENV}`,
        PORT: process.env.PORT,
      },
    },
  ],
};
