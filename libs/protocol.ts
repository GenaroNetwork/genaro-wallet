import { protocol } from "electron";
import { GENARO_ROOT_PATH } from "../src/app/libs/config";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { toFile as QRCode2File } from "qrcode";

let jdenticon = require("jdenticon");
const SIZE = 256;

let avatarDir = join(GENARO_ROOT_PATH, "avatar")
if (!existsSync(avatarDir))
    mkdirSync(avatarDir);

let qrCodeDir = join(GENARO_ROOT_PATH, "qrcode")
if (!existsSync(qrCodeDir))
    mkdirSync(qrCodeDir);

export default class {
    constructor() {
        protocol.registerFileProtocol("avatar", (req, cb) => {
            const id = req.url.substr(9);
            let avatarPath = join(avatarDir, `${id}.png`);
            if (!existsSync(avatarPath))
                writeFileSync(avatarPath, jdenticon.toPng(id, SIZE));
            cb(avatarPath);
        });
        protocol.registerFileProtocol("qrcode", (req, cb) => {
            const id = req.url.substr(9);
            let qrCodePath = join(qrCodeDir, `${id}.png`);
            if (existsSync(qrCodePath)) cb(qrCodePath);
            else {
                QRCode2File(qrCodePath, id, function (err) {
                    if (err) throw err;
                    cb(qrCodePath);
                })
            }
        });
    }
}