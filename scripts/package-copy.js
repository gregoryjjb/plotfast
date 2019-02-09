const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;

const source = name => path.resolve(name);
const dest = name => path.resolve('dist', name);

const cp = name => fs.copyFileSync(source(name), dest(name));
const cpf = name => ncp(source(name), dest(name), err => {});

// Remove prepublish stopper when copying package.json
let pjs = fs.readFileSync(source('package.json'), 'utf8');
let fixedPjs = pjs.replace(/"prepublishOnly".+,/g, '');
fs.writeFileSync(dest('package.json'), fixedPjs);

cp('Readme.md');
cp('yarn.lock');

ncp(source('src/img'), dest('img'), err => {});
