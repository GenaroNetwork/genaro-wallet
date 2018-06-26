import { homedir } from "os";
import { join } from "path";

export const PRODUCT_MODE = true;
export const LITE_WALLET = false;
export const GENARO_ROOT_PATH = join(homedir(), ".genaro");
export const WALLET_CONFIG_PATH = join(GENARO_ROOT_PATH, "wallet");
export const BC_STORAGE_PATH = join(GENARO_ROOT_PATH, "node"); // block chain storage path
export const BC_EXISTS_FILE = join(GENARO_ROOT_PATH, "bc-genesis.lock")
export const BC_LOG_FILE = join(GENARO_ROOT_PATH, "bc-log.log");
export const BC_ERR_FILE = join(GENARO_ROOT_PATH, "bc-err.log");
export const PLATFORM = "darwin-x64";

export const WEB3_CONFIG = {
    RPC_ADDR: "127.0.0.1",
    RPC_PORT: "8545",
    WS_ADDR: "127.0.0.1",
    WS_PORT: "8546",
    WS_ORIGINS: "*",
    WS_API: "eth,net,web3,admin,personal,miner",
};
Object.freeze(WEB3_CONFIG);

let WEB3_URL;
if (LITE_WALLET) {
    WEB3_URL = ""; // for product
} else {
    WEB3_URL = `ws://${WEB3_CONFIG.WS_ADDR}:${WEB3_CONFIG.WS_PORT}`; // for develope
}

export { WEB3_URL };