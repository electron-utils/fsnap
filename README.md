# fsnap

[![Linux Build Status](https://travis-ci.org/electron-utils/fsnap.svg?branch=master)](https://travis-ci.org/electron-utils/fsnap)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/i80hkk2bea8xbv9j?svg=true)](https://ci.appveyor.com/project/jwu/fsnap)
[![Dependency Status](https://david-dm.org/electron-utils/fsnap.svg)](https://david-dm.org/electron-utils/fsnap)
[![devDependency Status](https://david-dm.org/electron-utils/fsnap/dev-status.svg)](https://david-dm.org/electron-utils/fsnap#info=devDependencies)

Improved path module.

## Install

```bash
npm install --save fsnap
```

## Usage

```javascript
const fsnap = require('fsnap');

let s1 = fsnap.create(path);
let s2 = fsnap.create(path);
let result = fsnap.diff(s1, s2);

// do something...
console.log(result.delets);
console.log(result.changes);
console.log(result.creates);
```

## API Reference

### Methods

### fsnap.create(src, opts)

### fsnap.compare(s1, s2)

## License

MIT © 2017 Johnny Wu
