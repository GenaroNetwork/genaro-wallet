import { protocol } from "electron";
import { GENARO_ROOT_PATH } from "../src/app/libs/config";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
let jdenticon = require("jdenticon");
const SIZE = 256;

let avatarDir = join(GENARO_ROOT_PATH, "avatar")
if (!existsSync(avatarDir))
    mkdirSync(avatarDir);

export default class {
    constructor() {
        protocol.registerFileProtocol("avatar", (req, cb) => {
            const id = req.url.substr(9);
            let avatarPath = join(avatarDir, `${id}.png`);
            if (!existsSync(avatarPath))
                writeFileSync(avatarPath, jdenticon.toPng(id, SIZE));
            cb(avatarPath);
        });
    }
}