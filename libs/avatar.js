"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var config_1 = require("../src/app/libs/config");
var path_1 = require("path");
var fs_1 = require("fs");
var jdenticon = require("jdenticon");
var SIZE = 256;
var avatarDir = path_1.join(config_1.GENARO_ROOT_PATH, "avatar");
if (!fs_1.existsSync(avatarDir))
    fs_1.mkdirSync(avatarDir);
var default_1 = /** @class */ (function () {
    function default_1() {
        electron_1.protocol.registerFileProtocol("avatar", function (req, cb) {
            var id = req.url.substr(9);
            var avatarPath = path_1.join(avatarDir, id + ".png");
            if (!fs_1.existsSync(avatarPath))
                fs_1.writeFileSync(avatarPath, jdenticon.toPng(id, SIZE));
            cb(avatarPath);
        });
    }
    return default_1;
}());
exports["default"] = default_1;
