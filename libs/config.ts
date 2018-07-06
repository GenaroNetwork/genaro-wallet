import { homedir } from "os";
import { join } from "path";

export const PRODUCT_MODE = true;
export const LITE_WALLET = false;
export const SHARER = true;
export const GENARO_ROOT_PATH = join(homedir(), ".genaro");
export const WALLET_CONFIG_PATH = join(GENARO_ROOT_PATH, "wallet");
export const BC_STORAGE_PATH = join(GENARO_ROOT_PATH, "node"); // block chain storage path
export const BC_EXISTS_FILE = join(GENARO_ROOT_PATH, "bc-genesis.lock")
export const BC_LOG_FILE = join(GENARO_ROOT_PATH, "bc-log.log");
export const BC_ERR_FILE = join(GENARO_ROOT_PATH, "bc-err.log");
export const PLATFORM = "darwin-x64";

export const SPACE_UNIT_PRICE = 0.015 / 30; // GNX/GB*Day
export const TRAFFIC_UNIT_PRICE = 0.05; // GB

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
    WEB3_URL = ""; // for product
} else {
    WEB3_URL = `ws://${WEB3_CONFIG.WS_ADDR}:${WEB3_CONFIG.WS_PORT}`; // for develope
}

export { WEB3_URL, STX_ADDR };

export const BRIDGE_API_URL = 'http://118.31.61.119:8080';

export const DAEMON_CONFIG = {
    RPC_ADDR: "127.0.0.1",
    RPC_PORT: "45016",
    STORJ_NETWORK: "gtest",
    prodConfig: {
        'paymentAddress': '1EkMi5CFSkPY8jeAdfu3y1tUPCERQAf9xV',
        'opcodeSubscriptions': [
            '0f01020202',
            '0f02020202',
            '0f03020202'
        ],
        'bridges': [{
            'url': 'http://47.100.33.60:8080',
            'extendedKey': 'xpub6ABDixD5jpQUDWNzHFh2WgAuANKDeTHmeXqLYaXsUuzpvfN8ZvbfBMXXbYkoq1kCvvpbiNE9zAzeC9VQh8dMNDb8mjc8cUh8F4jaUmFkyjr'
        }],
        'seedList': [
            'storj://47.100.33.60:4000/337472da3068fa05d415262baf4df5bada8aefdc'
        ],
        'rpcAddress': '127.0.0.1',
        'rpcPort': 9001,
        'doNotTraverseNat': false,
        'maxTunnels': 3,
        'maxConnections': 150,
        'tunnelGatewayRange': {
            'min': 4001,
            'max': 4003
        },
        'joinRetry': {
            'times': 3,
            'interval': 5000
        },
        'offerBackoffLimit': 4,
        'networkPrivateKey': '-',
        'loggerOutputFile': '',
        'loggerVerbosity': 4,
        'storagePath': '',
        'storageAllocation': '50GB',
        'enableTelemetryReporting': false
    },
    testConfig: {
        'paymentAddress': '1EkMi5CFSkPY8jeAdfu3y1tUPCERQAf9xV',
        'opcodeSubscriptions': [
            '0f01020202',
            '0f02020202',
            '0f03020202'
        ],
        'bridges': [{
            'url': 'http://101.132.159.197:8080',
            'extendedKey': 'xpub6ABDixD5jpQUDWNzHFh2WgAuANKDeTHmeXqLYaXsUuzpvfN8ZvbfBMXXbYkoq1kCvvpbiNE9zAzeC9VQh8dMNDb8mjc8cUh8F4jaUmFkyjr'
        }],
        'seedList': [
            'storj://101.132.159.197:4000/337472da3068fa05d415262baf4df5bada8aefdc'
        ],
        'rpcAddress': '127.0.0.1',
        'rpcPort': 9002,
        'doNotTraverseNat': false,
        'maxTunnels': 3,
        'maxConnections': 150,
        'tunnelGatewayRange': {
            'min': 4001,
            'max': 4003
        },
        'joinRetry': {
            'times': 3,
            'interval': 5000
        },
        'offerBackoffLimit': 4,
        'networkPrivateKey': '5294f39e19c42cec5065693e4862bc29ea52c576c063e7e849612aad9a5587d9',
        'loggerOutputFile': '',
        'loggerVerbosity': 4,
        'storagePath': '',
        'storageAllocation': '50GB',
        'enableTelemetryReporting': false
    }
};