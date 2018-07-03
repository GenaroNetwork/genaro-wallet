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
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SubresourceIntegrityPlugin = require('webpack-subresource-integrity');
const license_webpack_plugin_1 = require("license-webpack-plugin");
const package_chunk_sort_1 = require("../../utilities/package-chunk-sort");
const base_href_webpack_1 = require("../../lib/base-href-webpack");
const index_html_webpack_plugin_1 = require("../../plugins/index-html-webpack-plugin");
const utils_1 = require("./utils");
/**
+ * license-webpack-plugin has a peer dependency on webpack-sources, list it in a comment to
+ * let the dependency validator know it is used.
+ *
+ * require('webpack-sources')
+ */
function getBrowserConfig(wco) {
  const {
    root,
    projectRoot,
    buildOptions
  } = wco;
  let extraPlugins = [];
  // Figure out which are the lazy loaded bundle names.
  const lazyChunkBundleNames = utils_1.normalizeExtraEntryPoints(
      // We don't really need a default name because we pre-filtered by lazy only entries.
      [...buildOptions.styles, ...buildOptions.scripts], 'not-lazy')
    .filter(entry => entry.lazy)
    .map(entry => entry.bundleName);
  const generateIndexHtml = false;
  if (generateIndexHtml) {
    extraPlugins.push(new HtmlWebpackPlugin({
      template: path.resolve(root, buildOptions.index),
      filename: path.resolve(buildOptions.outputPath, buildOptions.index),
      chunksSortMode: package_chunk_sort_1.packageChunkSort(buildOptions),
      excludeChunks: lazyChunkBundleNames,
      xhtml: true,
      minify: buildOptions.optimization ? {
        caseSensitive: true,
        collapseWhitespace: true,
        keepClosingSlash: true
      } : false
    }));
    extraPlugins.push(new base_href_webpack_1.BaseHrefWebpackPlugin({
      baseHref: buildOptions.baseHref
    }));
  }
  let sourcemaps = false;
  if (buildOptions.sourceMap) {
    // See https://webpack.js.org/configuration/devtool/ for sourcemap types.
    if (buildOptions.evalSourceMap && !buildOptions.optimization) {
      // Produce eval sourcemaps for development with serve, which are faster.
      sourcemaps = 'eval';
    } else {
      // Produce full separate sourcemaps for production.
      sourcemaps = 'source-map';
    }
  }
  if (buildOptions.subresourceIntegrity) {
    extraPlugins.push(new SubresourceIntegrityPlugin({
      hashFuncNames: ['sha384']
    }));
  }
  if (buildOptions.extractLicenses) {
    extraPlugins.push(new license_webpack_plugin_1.LicenseWebpackPlugin({
      pattern: /.*/,
      suppressErrors: true,
      perChunkOutput: false,
      outputFilename: `3rdpartylicenses.txt`
    }));
  }
  const {
    dependencies
  } = require(require("process").env.PWD + '/package.json');
  const whiteListedModules = ["@angular/animations", "ng-zorro-antd"];

  const globalStylesBundleNames = utils_1.normalizeExtraEntryPoints(buildOptions.styles, 'styles')
    .map(style => style.bundleName);
  return {target: "electron-renderer",
    

    devtool: sourcemaps,
    module: {
      rules: [{
        test: /\.node$/,
        use: 'node-loader'
      }],
    },
    externals: [
      ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
    ],
    resolve: {
      mainFields: [
        ...(wco.supportES2015 ? ['es2015'] : []),
        'browser', 'module', 'main'
      ]
    },
    output: {
      crossOriginLoading: buildOptions.subresourceIntegrity ? 'anonymous' : false,
      libraryTarget: 'commonjs2'
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        maxAsyncRequests: Infinity,
        cacheGroups: {
          default: buildOptions.commonChunk && {
            chunks: 'async',
            minChunks: 2,
            priority: 10,
          },
          common: buildOptions.commonChunk && {
            name: 'common',
            chunks: 'async',
            minChunks: 2,
            enforce: true,
            priority: 5,
          },
          vendors: false,
          vendor: buildOptions.vendorChunk && {
            name: 'vendor',
            chunks: 'initial',
            enforce: true,
            test: (module, chunks) => {
              const moduleName = module.nameForCondition ? module.nameForCondition() : '';
              return /[\\/]node_modules[\\/]/.test(moduleName) &&
                !chunks.some(({
                    name
                  }) => name === 'polyfills' ||
                  globalStylesBundleNames.includes(name));
            },
          },
        }
      }
    },
    plugins: extraPlugins.concat([
      new index_html_webpack_plugin_1.IndexHtmlWebpackPlugin({
        input: path.resolve(root, buildOptions.index),
        output: path.basename(buildOptions.index),
        baseHref: buildOptions.baseHref,
        entrypoints: package_chunk_sort_1.generateEntryPoints(buildOptions),
        deployUrl: buildOptions.deployUrl,
        sri: buildOptions.subresourceIntegrity,
      }),
    ]),
    node: false,
  };
}
exports.getBrowserConfig = getBrowserConfig;
