"use strict";
exports.__esModule = true;
var config_1 = require("../libs/config");
var electron_1 = require("electron");
var Web3 = require("genaro-web3");
var geth_1 = require("./geth");
electron_1.ipcMain.on("web3-start", function (event) {
    var web3 = new Web3(config_1.WEB3_URL);
    web3.eth.net.isListening()
        .then(function () {
        event.sender.send("web3-started");
    })["catch"](function (e) {
        // web3 is not connected
        if (config_1.LITE_WALLET) {
            // is lite wallet
            throw new Error("Can not connect to mordred.");
        }
        geth_1.GethLib.startGeth().then(function () {
            event.sender.send("web3-started");
        });
    });
});
var Web3Lib = /** @class */ (function () {
    function Web3Lib() {
    }
    return Web3Lib;
}());
exports.Web3Lib = Web3Lib;
