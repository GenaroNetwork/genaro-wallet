const {
  unlinkSync,
  copyFileSync,
  constants
} = require("fs");
const angularPath = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs';
constants.COPYFILE_FIC
unlinkSync(`${angularPath}/browser.js`);
unlinkSync(`${angularPath}/server.js`);
copyFileSync("./angular-support/browser.js", `${angularPath}/browser.js`);
copyFileSync("./angular-support/server.js", `${angularPath}/server.js`);
