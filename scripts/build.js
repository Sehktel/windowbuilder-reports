'use strict';

const fs = require('fs');
const rollup = require('rollup').rollup;
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const path = require('path');
const package_data = require(path.resolve(__dirname, '../package.json'));

const external = [
  'events',
  'moment',
  'alasql',
  'debug'
].concat(Object.keys(package_data.dependencies));

const plugins = [
	resolve({jsnext: true, main: true}),
	replace({PACKAGE_VERSION: package_data.version}),
	cleanup(),
];

const header = `/*!
 ${package_data.name} v${package_data.version}, built:${new Date().toISOString().split('T')[0]}
 © 2014-2018 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */\n\n`;

return rollup({
  input: path.resolve(__dirname, '../src/index.js'),
	external: function (id) {
    return external.indexOf(id) !== -1 ||
      /^metadata/.test(id) ||
      /^pouchdb/.test(id) ||
      /^paper/.test(id);
  },
	plugins,
})
	.then((bundle) => bundle.write({
		format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_'),
    banner: header,
    file: path.resolve(__dirname, '../index.js'),
    sourcemap: true,
	}));

