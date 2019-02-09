const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;

const source = name => path.resolve(name);
const dest = name => path.resolve('dist', name);

const cp = name => fs.copyFileSync(source(name), dest(name));
const cpf = name => ncp(source(name), dest(name), err => {});

cp('package.json');
cp('Readme.md');
cp('yarn.lock');

ncp(source('src/img'), dest('img'), err => {});
