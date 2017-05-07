'use strict';

const babel = require('rollup-plugin-babel');

module.exports = {
	entry: 'src/index.js',
	format: 'iife',
	plugins: [
		babel({
			// exclude: 'node_modules/**' // only transpile our source code
		})
	],
	dest: 'bundle.js'
};
