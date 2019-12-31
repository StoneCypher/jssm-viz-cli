
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript  from '@rollup/plugin-typescript';
import commonjs    from '@rollup/plugin-commonjs';
import ignore      from 'rollup-plugin-ignore';
import json        from '@rollup/plugin-json';

const pkg = require('./package');





const cjsconfig = {

  input     : 'src/ts/cli.ts',

  output    : {
    file      : 'build/cli.js',
    format    : 'cjs',
    name      : 'bin',
    banner    : '#!/usr/bin/env node\n'
  },

  plugins   : [

    json(),

    ignore(['fs', 'path', 'crypto']),

    typescript(),

    commonjs({
      include: 'node_modules/**'
    }),

    nodeResolve({
      mainFields     : [ 'module', 'main' ],
      browser        : true,
      extensions     : [ '.js', '.json', '.ts' ],
      preferBuiltins : false
    })

  ]

};






export default cjsconfig;
