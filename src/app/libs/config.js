"use strict";
exports.__esModule = true;
var os_1 = require("os");
var path_1 = require("path");
exports.PRODUCT_MODE = true;
exports.LITE_WALLET = false;
exports.GENARO_ROOT_PATH = path_1.join(os_1.homedir(), ".genaro");
exports.WALLET_CONFIG_PATH = path_1.join(exports.GENARO_ROOT_PATH, "wallet");
exports.BC_STORAGE_PATH = path_1.join(exports.GENARO_ROOT_PATH, "node"); // block chain storage path
exports.BC_EXISTS_FILE = path_1.join(exports.GENARO_ROOT_PATH, "bc-genesis.lock");
exports.BC_LOG_FILE = path_1.join(exports.GENARO_ROOT_PATH, "bc-log.log");
exports.BC_ERR_FILE = path_1.join(exports.GENARO_ROOT_PATH, "bc-err.log");
exports.PLATFORM = "darwin-x64";
exports.WEB3_CONFIG = {
    RPC_ADDR: "127.0.0.1",
    RPC_PORT: "8545",
    WS_ADDR: "127.0.0.1",
    WS_PORT: "8546",
    WS_ORIGINS: "*",
    WS_API: "eth,net,web3,admin,personal,miner"
};
Object.freeze(exports.WEB3_CONFIG);
var WEB3_URL;
exports.WEB3_URL = WEB3_URL;
if (exports.LITE_WALLET) {
    exports.WEB3_URL = WEB3_URL = ""; // for product
}
else {
    exports.WEB3_URL = WEB3_URL = "ws://" + exports.WEB3_CONFIG.WS_ADDR + ":" + exports.WEB3_CONFIG.WS_PORT; // for develope
}
exports.DAEMON_CONFIG = {
    RPC_ADDR: "127.0.0.1",
    RPC_PORT: "45016"
};
