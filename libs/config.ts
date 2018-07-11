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

const STX_ADDR = "0xc1b2e1fc9d2099f5930a669c9ad65509433550d6"

let WEB3_URL;
if (LITE_WALLET) {
    WEB3_URL = "ws://47.100.107.16:8547"; // for product
} else {
    WEB3_URL = `ws://${WEB3_CONFIG.WS_ADDR}:${WEB3_CONFIG.WS_PORT}`; // for develope
}

export { WEB3_URL, STX_ADDR };

export const BRIDGE_API_URL = 'http://118.31.61.119:8080';
export const DAEMON_CONFIG = require("./DAEMON_CONFIG.json");