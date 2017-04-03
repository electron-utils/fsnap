'use strict';

const tap = require('tap');
const fs = require('fs');
const jetpack = require('fs-jetpack');
const os = require('os');
const fsnap = require('../index');

let tmp = `${os.tmpdir()}/fsnap`;
jetpack.dir(tmp);

let testdata = `${tmp}/test-data`;
let pattern = `${tmp}/test-data/**/*`;

tap.test('fsnap', t => {
  t.beforeEach(done => {
    jetpack.remove(testdata);
    jetpack.copy(`${__dirname}/fixtures/test-data/`, testdata);
    jetpack.dir(`${tmp}/test-trash/`, { empty: true });

    done();
  });

  t.test('fsnap.create', t => {
    let s1 = fsnap.create(pattern);

    t.deepEqual(Object.keys(s1), [
      `${testdata}/bar`,
      `${testdata}/bar/bar-01`,
      `${testdata}/bar/bar-01/foobar.js`,
      `${testdata}/bar/bar-02`,
      `${testdata}/bar/bar-02/foobar.js`,
      `${testdata}/bar/bar-03`,
      `${testdata}/bar/bar-03/foobar.js`,
      `${testdata}/bar/foobar.js`,
      `${testdata}/foo`,
      `${testdata}/foo-bar`,
      `${testdata}/foo-bar.meta`,
      `${testdata}/foo-bar/foo-01.js`,
      `${testdata}/foo-bar/foo-02.js`,
      `${testdata}/foo-bar/foo-03.js`,
      `${testdata}/foo/foo-01`,
      `${testdata}/foo/foo-01/foobar.js`,
      `${testdata}/foo/foo-02`,
      `${testdata}/foo/foo-02/foobar.js`,
      `${testdata}/foo/foo-03`,
      `${testdata}/foo/foo-03/foobar.js`,
      `${testdata}/foo/foobar.js`,
      `${testdata}/foobar.js`,
      `${testdata}/foobar.js.meta`,
    ]);

    t.end();
  });

  t.test('fsnap.create multi-source', t => {
    let s1 = fsnap.create([
      `${testdata}/bar/**/*`,
      `${testdata}/foo/**/*`,
    ]);

    t.deepEqual(Object.keys(s1), [
      `${testdata}/bar/bar-01`,
      `${testdata}/bar/bar-01/foobar.js`,
      `${testdata}/bar/bar-02`,
      `${testdata}/bar/bar-02/foobar.js`,
      `${testdata}/bar/bar-03`,
      `${testdata}/bar/bar-03/foobar.js`,
      `${testdata}/bar/foobar.js`,
      `${testdata}/foo/foo-01`,
      `${testdata}/foo/foo-01/foobar.js`,
      `${testdata}/foo/foo-02`,
      `${testdata}/foo/foo-02/foobar.js`,
      `${testdata}/foo/foo-03`,
      `${testdata}/foo/foo-03/foobar.js`,
      `${testdata}/foo/foobar.js`,
    ]);

    t.end();
  });

  t.test('fsnap.diff', t => {
    t.test('new file', t => {
      let s1 = fsnap.create(pattern);
      fs.writeFileSync(`${testdata}/foo/foo-01/foobar-new.js`, 'Hello World!');
      fs.writeFileSync(`${testdata}/foo/foobar-new.js`, 'Hello World!');
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        deletes: [],
        changes: [],
        creates: [
          `${testdata}/foo/foo-01/foobar-new.js`,
          `${testdata}/foo/foobar-new.js`,
        ]
      });

      t.end();
    });

    t.test('new folder', t => {
      let s1 = fsnap.create(pattern);
      fs.mkdirSync(`${testdata}/foo/foo-01-new`);
      fs.mkdirSync(`${testdata}/foo-new`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        deletes: [],
        changes: [],
        creates: [
          `${testdata}/foo-new`,
          `${testdata}/foo/foo-01-new`,
        ]
      });

      t.end();
    });

    t.test('delete file', t => {
      let s1 = fsnap.create(pattern);
      jetpack.remove(`${testdata}/foo/foobar.js`);
      jetpack.remove(`${testdata}/foo/foo-01/foobar.js`);

      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        creates: [],
        changes: [],
        deletes: [
          `${testdata}/foo/foo-01/foobar.js`,
          `${testdata}/foo/foobar.js`,
        ]
      });

      t.end();
    });

    t.test('delete folder', t => {
      let s1 = fsnap.create(pattern);
      jetpack.remove(`${testdata}/bar`);
      jetpack.remove(`${testdata}/foo/foo-01`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        creates: [],
        changes: [],
        deletes: [
          `${testdata}/bar`,
          `${testdata}/bar/bar-01`,
          `${testdata}/bar/bar-01/foobar.js`,
          `${testdata}/bar/bar-02`,
          `${testdata}/bar/bar-02/foobar.js`,
          `${testdata}/bar/bar-03`,
          `${testdata}/bar/bar-03/foobar.js`,
          `${testdata}/bar/foobar.js`,
          `${testdata}/foo/foo-01`,
          `${testdata}/foo/foo-01/foobar.js`,
        ]
      });

      t.end();
    });

    t.test('rename file', t => {
      let s1 = fsnap.create(pattern);
      jetpack.move(`${testdata}/foo/foobar.js`, `${testdata}/foo/foobar-rename.js`);
      jetpack.move(`${testdata}/foo/foo-01/foobar.js`, `${testdata}/bar/bar-01/foobar-rename.js`);
      jetpack.move(`${testdata}/foo/foo-02/foobar.js`, `${testdata}/bar/bar-02/foobar-rename.js`);
      jetpack.move(`${testdata}/foo/foo-03/foobar.js`, `${testdata}/bar/bar-02/foobar-rename.js`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [
          `${testdata}/bar/bar-01/foobar-rename.js`,
          `${testdata}/bar/bar-02/foobar-rename.js`,
          `${testdata}/foo/foobar-rename.js`,
        ],
        deletes: [
          `${testdata}/foo/foo-01/foobar.js`,
          `${testdata}/foo/foo-02/foobar.js`,
          `${testdata}/foo/foo-03/foobar.js`,
          `${testdata}/foo/foobar.js`,
        ]
      });

      t.end();
    });

    t.test('rename folder', t => {
      let s1 = fsnap.create(pattern);
      jetpack.move(`${testdata}/foo/foo-01`, `${testdata}/bar/bar-04`);
      jetpack.move(`${testdata}/foo/foo-02`, `${testdata}/bar/bar-04/bar-02`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [
          `${testdata}/bar/bar-04`,
          `${testdata}/bar/bar-04/bar-02`,
          `${testdata}/bar/bar-04/bar-02/foobar.js`,
          `${testdata}/bar/bar-04/foobar.js`,
        ],
        deletes: [
          `${testdata}/foo/foo-01`,
          `${testdata}/foo/foo-01/foobar.js`,
          `${testdata}/foo/foo-02`,
          `${testdata}/foo/foo-02/foobar.js`,
        ]
      });

      t.end();
    });

    t.test('edit file', {timeout: 2000}, t => {
      let s1 = fsnap.create(pattern);
      setTimeout(() => {
        fs.writeFileSync(`${testdata}/foo/foobar.js`, 'Hello World!');
        fs.writeFileSync(`${testdata}/foo/foo-02/foobar.js`, 'Hello World!');
        fs.writeFileSync(`${testdata}/bar/bar-01/foobar-new.js`, 'Hello World!');

        let s2 = fsnap.create(pattern);

        let result = fsnap.diff(s1, s2);
        t.deepEqual(result, {
          changes: [
            `${testdata}/foo/foo-02/foobar.js`,
            `${testdata}/foo/foobar.js`,
          ],
          creates: [
            `${testdata}/bar/bar-01/foobar-new.js`,
          ],
          deletes: []
        });

        t.end();
      }, 1000);
    });

    t.test('move out file', t => {
      let s1 = fsnap.create(pattern);
      jetpack.move(`${testdata}/foo/foobar.js`, `${tmp}/test-trash/foobar.js`);
      jetpack.move(`${testdata}/bar/foobar.js`, `${tmp}/test-trash/bar-foobar.js`);
      jetpack.move(`${tmp}/test-trash/bar-foobar.js`, `${testdata}/bar/foobar.js`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [],
        deletes: [
          `${testdata}/foo/foobar.js`,
        ]
      });

      t.end();
    });

    t.test('delete and copy the same file', t => {
      let s1 = fsnap.create(pattern);
      setTimeout(() => {
        jetpack.remove(`${testdata}/foobar.js`);
        jetpack.copy(`${testdata}/foobar.js.meta`, `${testdata}/foobar.js`);
        let s2 = fsnap.create(pattern);

        let result = fsnap.diff(s1, s2);
        t.deepEqual(result, {
          changes: [
            `${testdata}/foobar.js`,
          ],
          creates: [],
          deletes: []
        });

        t.end();
      }, 1000);
    });

    t.test('delete file and meta', t => {
      let s1 = fsnap.create(pattern);
      jetpack.remove(`${testdata}/foobar.js`);
      jetpack.remove(`${testdata}/foobar.js.meta`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [],
        deletes: [
          `${testdata}/foobar.js`,
          `${testdata}/foobar.js.meta`,
        ]
      });

      t.end();
    });

    t.test('delete folder and meta', t => {
      let s1 = fsnap.create(pattern);
      jetpack.remove(`${testdata}/foo-bar`);
      jetpack.remove(`${testdata}/foo-bar.meta`);
      let s2 = fsnap.create(pattern);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [],
        deletes: [
          `${testdata}/foo-bar`,
          `${testdata}/foo-bar.meta`,
          `${testdata}/foo-bar/foo-01.js`,
          `${testdata}/foo-bar/foo-02.js`,
          `${testdata}/foo-bar/foo-03.js`,
        ]
      });

      t.end();
    });

    t.end();
  });

  t.test('fsnap.diff (compound)', t => {
    t.test('rename, new, delete, edit files', t => {
      let s1 = fsnap.create(pattern);
      setTimeout(() => {
        fs.writeFileSync(`${testdata}/foo/foobar.js`, 'Hello World!');
        jetpack.remove(`${testdata}/foo/foobar.js`);

        fs.writeFileSync(`${testdata}/foo/foo-02/foobar.js`, 'Hello World!');
        fs.writeFileSync(`${testdata}/bar/bar-01/foobar-new.js`, 'Hello World!');

        jetpack.move(`${testdata}/foo/foo-03/foobar.js`, `${testdata}/bar/bar-03/foobar-rename.js`);
        jetpack.remove(`${testdata}/foo/foo-01/foobar.js`);
        jetpack.remove(`${testdata}/bar/bar-03/foobar-rename.js`);

        let s2 = fsnap.create(pattern);

        let result = fsnap.diff(s1, s2);
        t.deepEqual(result, {
          changes: [
            `${testdata}/foo/foo-02/foobar.js`,
          ],
          creates: [
            `${testdata}/bar/bar-01/foobar-new.js`,
          ],
          deletes: [
            `${testdata}/foo/foo-01/foobar.js`,
            `${testdata}/foo/foo-03/foobar.js`,
            `${testdata}/foo/foobar.js`,
          ]
        });

        t.end();
      }, 1000);
    });

    t.test('rename, new, delete, edit folders', t => {
      let s1 = fsnap.create(pattern);
      setTimeout(() => {
        jetpack.remove(`${testdata}/foo/foo-01`);
        jetpack.remove(`${testdata}/bar`);

        jetpack.move(`${testdata}/foo`, `${testdata}/bar-new`);
        jetpack.dir(`${testdata}/foo-new`);
        jetpack.dir(`${testdata}/foo-new/foo-01`);

        let s2 = fsnap.create(pattern);

        let result = fsnap.diff(s1, s2);
        t.deepEqual(result, {
          changes: [],
          creates: [
            `${testdata}/bar-new`,
            `${testdata}/bar-new/foo-02`,
            `${testdata}/bar-new/foo-02/foobar.js`,
            `${testdata}/bar-new/foo-03`,
            `${testdata}/bar-new/foo-03/foobar.js`,
            `${testdata}/bar-new/foobar.js`,
            `${testdata}/foo-new`,
            `${testdata}/foo-new/foo-01`,
          ],
          deletes: [
            `${testdata}/bar`,
            `${testdata}/bar/bar-01`,
            `${testdata}/bar/bar-01/foobar.js`,
            `${testdata}/bar/bar-02`,
            `${testdata}/bar/bar-02/foobar.js`,
            `${testdata}/bar/bar-03`,
            `${testdata}/bar/bar-03/foobar.js`,
            `${testdata}/bar/foobar.js`,
            `${testdata}/foo`,
            `${testdata}/foo/foo-01`,
            `${testdata}/foo/foo-01/foobar.js`,
            `${testdata}/foo/foo-02`,
            `${testdata}/foo/foo-02/foobar.js`,
            `${testdata}/foo/foo-03`,
            `${testdata}/foo/foo-03/foobar.js`,
            `${testdata}/foo/foobar.js`,
          ]
        });

        t.end();
      }, 1000);
    });

    t.test('multiple source', t => {
      let s1 = fsnap.create([
        `${testdata}/bar/**/*`,
        `${testdata}/foo/**/*`,
      ]);

      jetpack.move(`${testdata}/foo/foo-01/foobar.js`, `${testdata}/bar/bar-01/foobar-rename.js`);
      jetpack.move(`${testdata}/foo-bar/foo-01.js`, `${testdata}/foo-bar/foo-04.js`);

      let s2 = fsnap.create([
        `${testdata}/bar/**/*`,
        `${testdata}/foo/**/*`,
      ]);

      let result = fsnap.diff(s1, s2);
      t.deepEqual(result, {
        changes: [],
        creates: [
          `${testdata}/bar/bar-01/foobar-rename.js`,
        ],
        deletes: [
          `${testdata}/foo/foo-01/foobar.js`,
        ]
      });

      t.end();
    });

    t.end();
  });

  t.end();
});