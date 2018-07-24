let lib = require("libgenaro");
let env = new lib.Environment({
	bridgeUrl: 'http://118.31.61.119:8080',
        keyFile: '{"version":3,"id":"bea87d89-c0e7-42f9-9f7b-2d971fadc0b8","address":"5d14313c94f1b26d23f4ce3a49a2e136a88a584b","crypto":{"ciphertext":"7ec97b04f1baae1a31f282f90dd7a847ae49793cd7a4a532d721054073a60fa3","cipherparams":{"iv":"294912beb503b246f23353b72177bdcb"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"495f86aa92ac9dce4291a3f53ca8c2812ee462bb4a8cb36ca1ff122ab26e3fda","n":262144,"r":8,"p":1},"mac":"71fc583e0f76adcdc57096871c858d54031888e617333cc0f1957e85aa9dcf17"},"name":"文件"}',
        passphrase: '111111',
});

env.listFiles("2dd9806ee607bfb4fc7d2f78", (e, result) => {result});
