import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export const PRODUCT_MODE = true;
export const LITE_WALLET = true;
export const SHARER = true;
export const GENARO_ROOT_PATH = join(homedir(), ".genaro");
export const WALLET_CONFIG_PATH = join(GENARO_ROOT_PATH, "wallet");
export const BC_STORAGE_PATH = join(GENARO_ROOT_PATH, "node"); // block chain storage path
export const BC_EXISTS_FILE = join(GENARO_ROOT_PATH, "bc-genesis.lock")
export const BC_LOG_FILE = join(GENARO_ROOT_PATH, "bc-log.log");
export const BC_ERR_FILE = join(GENARO_ROOT_PATH, "bc-err.log");
export const SQLITE_CONFIG_PATH = join(GENARO_ROOT_PATH, "sqlite");
if (!existsSync(GENARO_ROOT_PATH)) mkdirSync(GENARO_ROOT_PATH);
if (!existsSync(WALLET_CONFIG_PATH)) mkdirSync(WALLET_CONFIG_PATH);
if (!existsSync(SQLITE_CONFIG_PATH)) mkdirSync(SQLITE_CONFIG_PATH);


// all
export const SETTINGS = {
    showWallet: [true, false], // default editable
    showEden: [true, true],
    showTxEden: [true, true],
    showSharer: [true, true],
    showTxSharer: [true, true],
    lang: ['en', true],
}

// wallet
// export const SETTINGS = {
//     showWallet: [true, false], // default editable
//     showEden: [false, false],
//     showTxEden: [true, true],
//     showSharer: [false, false],
//     showTxSharer: [true, true],
//     lang: ['en', true],
// }


// eden
// export const SETTINGS = {
//     showWallet: [true, false], // default editable
//     showEden: [true, true],
//     showTxEden: [true, true],
//     showSharer: [false, false],
//     showTxSharer: [false, false],
//     lang: ['en', true],
// }


// sharer
// export const SETTINGS = {
//     showWallet: [true, false], // default editable
//     showEden: [false, false],
//     showTxEden: [false, false],
//     showSharer: [true, true],
//     showTxSharer: [true, true],
//     lang: ['en', true],
// }

export const PLATFORM = "darwin-x64";
export const FULL_NODE_URL = "enode://bf9599927eaf4993fdb6ff15f6918a6ca35f9126ef25a51acb3c94e93d39113acb40794643b4dd7a30a7f4db537a9cf0fef65d3ebddb89d5ddd0487fc265e65a@118.31.61.119:30315";

export const SPACE_UNIT_PRICE = 0.015 / 30; // GNX/GB*Day
export const TRAFFIC_UNIT_PRICE = 0.05; // GB
export const STAKE_PER_NODE = 5000;

export const WEB3_CONFIG = {
    RPC_ADDR: "127.0.0.1",
    RPC_PORT: "8545",
    WS_ADDR: "127.0.0.1",
    WS_PORT: "8546",
    WS_ORIGINS: "*",
    WS_API: "eth,net,web3,admin,personal,miner"
};
Object.freeze(WEB3_CONFIG);

const STX_ADDR = "0x6000000000000000000000000000000000000000"

let WEB3_URL;
if (LITE_WALLET) {
    WEB3_URL = "ws://47.100.107.16:8547"; // for LITE
} else {
    WEB3_URL = `ws://${WEB3_CONFIG.WS_ADDR}:${WEB3_CONFIG.WS_PORT}`; // for FULL NODE
}

export { WEB3_URL, STX_ADDR };

export const BRIDGE_API_URL = 'http://118.31.61.119:8080';
// export const BRIDGE_API_URL = 'http://192.168.0.55:8080';
export const DAEMON_CONFIG = require("./DAEMON_CONFIG.json");

export const SENTINEL_WEB = 'http://118.31.61.119:8001';


export enum TASK_TYPE {
    FILE_UPLOAD = 0,
    FILE_DOWNLOAD = 1,
}

export enum TASK_STATE {
    INIT = 0,
    INPROCESS = 1,
    DONE = 2,
    ERROR = 3,
    CANCEL = 4,
}
export const GET_AGREEMENT = (l) => {
    return `https://genaro.network/${l}/genaro-eden/user-agreement`;
};
export const GET_TUTORIAL = (l) => {
    return `https://genaro.network/${l}/genaro-eden/user-tutorial`;
};

export const CHECK_MAC_UPDATE_URL = "";
export const CHECK_WIN_UPDATE_URL = "";

export const INSTRUCTIONS_URL = "";
export const DOWNLOAD_EDEN_URL = "";
export const DOWNLOAD_SHARER_URL = "";
