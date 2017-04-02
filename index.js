'use strict';

const globby = require ('globby');
const fs = require ('fs');
const path_ = require ('path');

let fsnap = {};

/**
 * @method create
 * @param {string} path
 * @param {object} opts
 */
fsnap.create = function (src, opts = {}) {
  if (Array.isArray(src)) {
    src = src.map(p => {
      return `${p}/**/*`;
    });
  } else {
    src = `${src}/**/*`;
  }

  let paths = globby.sync(src, opts);
  let snapshot = {};

  paths.forEach(p => {
    p = path_.normalize(p);

    // NOTE: it is possible we delete file between Globby and statSync
    // for this files, we will skip watch their changes
    let stat;
    try {
      stat = fs.statSync(p);
    } catch (err) {
      return;
    }

    snapshot[p] = stat;
  });

  return snapshot;
};

/**
 * @method diff
 * @param {string} path
 * @param {object} opts
 */
fsnap.diff = function (s1, s2) {
  let result = {
    deletes: [],
    creates: [],
    changes: []
  };

  // compare s1 to s2
  for (let path in s1) {
    let stat1 = s1[path];
    let stat2 = s2[path];

    if (stat2 === undefined) {
      // delete
      result.deletes.push(path);
    } else if (stat1.isDirectory() !== stat2.isDirectory()) {
      // file <-> directory switched
      result.deletes.push(path);
      result.creates.push(path);
    } else if (stat1.isFile() && stat1.mtime.getTime() !== stat2.mtime.getTime()) {
      result.changes.push(path);
    }
  }

  // compare s2 to s1
  for ( let path in s2 ) {
    let stat1 = s1[path];

    if (stat1 === undefined) {
      result.creates.push(path);
    }
  }

  return result;
};

// ========================================
// exports
// ========================================

module.exports = fsnap;