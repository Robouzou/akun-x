'use strict';

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

module.exports = {
	entry: 'src/index.js',
	format: 'iife',
	plugins: [
		nodeResolve({
			jsnext: true,
			browser: true,
			extensions: ['.js', '.json']
		}),
		commonjs({
			sourceMap: false
		}),
		babel({
		})
	],
	dest: 'bundle.js'
};
