"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Returns a partial specific to creating a bundle for node
 * @param wco Options which are include the build options and app config
 */
const {
  dependencies
} = require(require("process").env.PWD + '/package.json');
const whiteListedModules = ["@angular/animations", "ng-zorro-antd"];

function getServerConfig(wco) {
  const config = {
    devtool: wco.buildOptions.sourceMap ? 'source-map' : false,
    resolve: {
      mainFields: [
        ...(wco.supportES2015 ? ['es2015'] : []),
        'main', 'module',
      ],
      extensions: ['.js', '.json', '.node']
    },
    externals: [
      ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
    ],
    target: 'electron-main',
    output: {
      libraryTarget: 'commonjs2'
    },
    node: {
      __dirname: process.env.NODE_ENV !== 'production',
      __filename: process.env.NODE_ENV !== 'production'
    },
  };
  if (wco.buildOptions.bundleDependencies == 'none') {
    config.externals = [
      /^@angular/,
      (_, request, callback) => {
        // Absolute & Relative paths are not externals
        if (request.match(/^\.{0,2}\//)) {
          return callback();
        }
        try {
          // Attempt to resolve the module via Node
          const e = require.resolve(request);
          if (/node_modules/.test(e)) {
            // It's a node_module
            callback(null, request);
          } else {
            // It's a system thing (.ie util, fs...)
            callback();
          }
        } catch (e) {
          // Node couldn't find it, so it must be user-aliased
          callback();
        }
      }
    ];
  }
  return config;
}
exports.getServerConfig = getServerConfig;
