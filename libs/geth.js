"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var config_1 = require("../libs/config");
var GethLib = /** @class */ (function () {
    function GethLib() {
    }
    GethLib.startGeth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initBC, startBC;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initBC = function () {
                            return new Promise(function (res) {
                                var initCLI = child_process_1.spawn(__dirname + "/geth/geth-" + config_1.PLATFORM, [
                                    "init",
                                    __dirname + "/geth/config.json",
                                    "--datadir",
                                    config_1.BC_STORAGE_PATH,
                                ]);
                                initCLI.on("close", function () {
                                    fs_1.writeFileSync(config_1.BC_EXISTS_FILE, "done");
                                    //writeFileSync(BC_LOG_FILE, "done");
                                    //writeFileSync(BC_ERR_FILE, "done");
                                });
                                initCLI.on("close", function () { return res(); });
                            });
                        };
                        startBC = function () {
                            return new Promise(function (res) {
                                var startCLI = child_process_1.spawn(__dirname + "/geth/geth-" + config_1.PLATFORM, [
                                    "--datadir",
                                    config_1.BC_STORAGE_PATH,
                                    /*"--rpc",
                                    "--rpcaddr",
                                    WEB3_CONFIG.RPC_ADDR,
                                    "--rpcport",
                                    WEB3_CONFIG.RPC_PORT,*/
                                    "--ws",
                                    "--wsaddr",
                                    config_1.WEB3_CONFIG.WS_ADDR,
                                    "--wsport",
                                    config_1.WEB3_CONFIG.WS_PORT,
                                    "--wsorigins",
                                    config_1.WEB3_CONFIG.WS_ORIGINS,
                                    "--wsapi",
                                    config_1.WEB3_CONFIG.WS_API,
                                ]);
                                var started = false;
                                startCLI.stdout.on("data", function (data) {
                                    fs_1.appendFileSync(config_1.BC_LOG_FILE, data);
                                });
                                startCLI.stderr.on("data", function (data) {
                                    fs_1.appendFileSync(config_1.BC_ERR_FILE, data);
                                    if (started)
                                        return;
                                    if (data.toString().indexOf(config_1.WEB3_URL) > -1) {
                                        started = true;
                                        res();
                                    }
                                    ;
                                });
                            });
                        };
                        if (!!fs_1.existsSync(config_1.BC_EXISTS_FILE)) return [3 /*break*/, 2];
                        return [4 /*yield*/, initBC()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, startBC()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GethLib;
}());
exports.GethLib = GethLib;
