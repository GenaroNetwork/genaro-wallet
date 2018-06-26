const fs = require('fs');
const f_angular = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f_angular, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/node: false/g, 'node: {}');
  result = result.replace(/node: \{.*?\}/g, 'node: {crypto: true, stream: true, os: true, path: true}');

  fs.writeFile(f_angular, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});

const f_web3 = 'node_modules/web3/types.d.ts';

fs.readFile(f_web3, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/import \{ BigNumber \} from '.*?'/g, `import { BigNumber } from 'bignumber.js'`);

  fs.writeFile(f_web3, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
