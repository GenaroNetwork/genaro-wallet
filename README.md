# Introduction

This repo is for GNX test net client, with the following functions:
- Wallet - manager private keys, transfer GNXs, view history transactions and so on
- Eden - file upload/download client interacting with GNX distributed file storage
- Sharer - file storage which anyone can run, to earn GNX reward

# Infrastructure

- Angular v6.0.3
- Angular-CLI v6.0.3
- Electron v2.0.1
- Electron Builder v20.13.4
- [jswallet-manager](https://www.npmjs.com/package/jswallet-manager) for Wallet
- [genaro-web3](https://www.npmjs.com/package/genaro-web3) for interact with blockchain
- [node-libgenaro](https://github.com/GenaroNetwork/node-libgenaro) as file upload/download client
- [genaroshare-daemon](https://www.npmjs.com/package/genaroshare-daemon) for sharing disk space

# Getting Started
```
npm i
```

### run
```
npm start
```

### build 
```
# on mac
npm run electron:mac

# on windows
npm run electron:windows

# on linux
npm run electron:linux
```

# Folder layout
*   libs # libs in main process
    *   config.ts # config file
*   prewindow # window before main process rendered
*   src # main code
    *   app # main code
        *   pipes # angular pipes
        *   components # angular components
        *   libs # libs in render process
        *   prividers # angular providers
        *   services # angular services
    *   assets # static files
    *   environments 

# licence
