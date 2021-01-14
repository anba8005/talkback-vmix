#!/bin/bash

cd ..
yarn --force
yarn build
yarn --production
yarn compact
pkg -c package-mac.json --out-path bin/ --target node14-mac-x64 build/index.js
pkg -c package-linux.json --out-path bin/ --target node14-linux-x64 build/index.js
pkg -c package-win.json --out-path bin/ --target node14-win-x64 build/index.js
yarn --force
cd scripts
