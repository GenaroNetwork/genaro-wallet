import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const PRODUCT_MODE = true;
export const LITE_WALLET = true;
export const SHARER = true;
export const PLATFORM = 'darwin-x64';
export const FULL_NODE_URL = 'enode://bf9599927eaf4993fdb6ff15f6918a6ca35f9126ef25a51acb3c94e93d39113acb40794643b4dd7a30a7f4db537a9cf0fef65d3ebddb89d5ddd0487fc265e65a@47.100.33.60:30315';
export const SPACE_UNIT_PRICE = 0.015 / 30; // GNX/GB*Day
export const TRAFFIC_UNIT_PRICE = 0.05; // GB
export const STAKE_PER_NODE = 5000;

export const WEB3_CONFIG = {
    RPC_ADDR: '127.0.0.1',
    RPC_PORT: '8545',
    WS_ADDR: '127.0.0.1',
    WS_PORT: '8546',
    WS_ORIGINS: '*',
    WS_API: 'eth,net,web3,admin,personal,miner'
};
Object.freeze(WEB3_CONFIG);

const STX_ADDR = '0x6000000000000000000000000000000000000000';

export const DAEMON_CONFIG = require('./DAEMON_CONFIG.json');

export const SENTINEL_WEB = 'http://sentinel.genaro.network';

export const SENTINEL_API = 'http://118.31.61.119:8000';

export const TOP_FARMER_URL = SENTINEL_API + '/farmers';

export const FARMER_URL = SENTINEL_API + '/farmer/';

export enum TASK_TYPE {
    FILE_UPLOAD = 0,
    FILE_DOWNLOAD = 1,
    SEND_MESSAGE = 2,
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

export const CHECK_MAC_UPDATE_URL = '';
export const CHECK_WIN_UPDATE_URL = '';

export const INSTRUCTIONS_URL = '';
export const DOWNLOAD_EDEN_URL = '';
export const DOWNLOAD_SHARER_URL = '';

export const BLOCK_COUNT_OF_ROUND = 43200;
export enum Role {
    Free = 'Free',
    Main = 'Main',
    Sub = 'Sub'
}
// brother hood:
export const RELATION_FETCH_INTERVAL = 2 * 60 * 1000;
export const BROTHER_CONTRACT_ADDR = '0x5f260d5c1b8ccba5193eeec3e08635c4435a6e9e';

export const MINER_DOWNLOAD = 'https://gnxtech.io/en/gnx-dapps/';

export const DAPP_PAGE = 'http://genaro-docs.oss-cn-shanghai.aliyuncs.com/dapp-develop-guide.pdf';

// autoupdate
export enum UPDATE_STATES {
    DEFAULT = 0,
    CHECKING = 1,
    AVAILABLE = 2,
    NOT_AVAILABLE = 3,
    DOWNLOADING = 4,
    DOWNLOADED = 5,
    ERROR = 9,
}

export function setNetType(type) {
    let GENARO_ROOT_PATH_0 = join(homedir(), '.genaro');
    if (type === 'main') {
        GENARO_ROOT_PATH = join(GENARO_ROOT_PATH_0, 'main');
        WEB3_URL = 'ws://47.100.34.71:8547';
        BRIDGE_API_URL = 'http://47.100.33.60:8080';
    }
    else if (type === 'test') {
        GENARO_ROOT_PATH = join(GENARO_ROOT_PATH_0, 'test');
        WEB3_URL = 'ws://47.100.107.16:8547';
        BRIDGE_API_URL = 'http://118.31.61.119:8080';
    }

    if (!LITE_WALLET) {
        WEB3_URL = `ws://${WEB3_CONFIG.WS_ADDR}:${WEB3_CONFIG.WS_PORT}`; // for FULL NODE
    }

    WALLET_CONFIG_PATH = join(GENARO_ROOT_PATH_0, 'wallet');
    BC_STORAGE_PATH = join(GENARO_ROOT_PATH, 'node'); // block chain storage path
    MESSAGE_STORAGE_PATH = join(GENARO_ROOT_PATH, 'message');
    BC_EXISTS_FILE = join(GENARO_ROOT_PATH, 'bc-genesis.lock');
    BC_LOG_FILE = join(GENARO_ROOT_PATH, 'bc-log.log');
    BC_ERR_FILE = join(GENARO_ROOT_PATH, 'bc-err.log');
    BROTHER_STATE_FILE = join(GENARO_ROOT_PATH, 'brotherhood.json');
    SQLITE_CONFIG_PATH = join(GENARO_ROOT_PATH, 'sqlite');
    if (!existsSync(GENARO_ROOT_PATH_0)) { mkdirSync(GENARO_ROOT_PATH_0); }
    if (!existsSync(GENARO_ROOT_PATH)) { mkdirSync(GENARO_ROOT_PATH); }
    if (!existsSync(WALLET_CONFIG_PATH)) { mkdirSync(WALLET_CONFIG_PATH); }
    if (!existsSync(SQLITE_CONFIG_PATH)) { mkdirSync(SQLITE_CONFIG_PATH); }
    if (!existsSync(BC_STORAGE_PATH)) { mkdirSync(BC_STORAGE_PATH); }
    if (!existsSync(MESSAGE_STORAGE_PATH)) { mkdirSync(MESSAGE_STORAGE_PATH); }
}

let GENARO_ROOT_PATH = '';
let WALLET_CONFIG_PATH = '';
let BC_STORAGE_PATH = ''; // block chain storage path
let MESSAGE_STORAGE_PATH = '';
let BC_EXISTS_FILE = '';
let BC_LOG_FILE = '';
let BC_ERR_FILE = '';
let BROTHER_STATE_FILE = '';
let SQLITE_CONFIG_PATH = '';

let WEB3_URL = '';
let BRIDGE_API_URL = '';

setNetType('main');

export {
    GENARO_ROOT_PATH,
    WALLET_CONFIG_PATH,
    BC_STORAGE_PATH,
    MESSAGE_STORAGE_PATH,
    BC_EXISTS_FILE,
    BC_LOG_FILE,
    BC_ERR_FILE,
    BROTHER_STATE_FILE,
    SQLITE_CONFIG_PATH,
    WEB3_URL, 
    STX_ADDR,
    BRIDGE_API_URL
};