var CardanoWallet = require('../wallet/cardano');
const logger = require('./util/logger');
logger.debug("cardano wallet" + CardanoWallet);
var Wallet = new CardanoWallet();

test('create wallet', () => {
    Wallet.createWallet("123456h67890fsfrdssdcdredsafd432");
});

test('check balance wallet', () => {
    Wallet.balance("DdzFFzCqrhsxN8fVwcqCFG4qhLLFBSxvgbe3v5QRkXhH5JoZMXS2AtNC7bboceUWKmagmwPH2McJmyjRaKPxuEEK47Psc36pcw3C3apG",
        "Ae2tdPwUPEYydixcsq6iZyHL8nC8oHFU9DECmbthvy3XoozeF2yaPnmHiXr");
});

test('check transaction fees', () => {
    Wallet.fees("Ae2tdPwUPEYydixcsq6iZyHL8nC8oHFU9DECmbthvy3XoozeF2yaPnmHiXr@2147483648",
        "DdzFFzCqrht2o3yDwMx9pc6dakRVeACmX8Bu2yvj5umDqsuU6DSx1B9G1RTesPpF1uvkTdyUcoWT3wnTCUcmkun12BGCchnWdFfgkxEL", 1000000);
});

test('Perform transfer from to account....', () => {
    Wallet.transfer("Ae2tdPwUPEYydixcsq6iZyHL8nC8oHFU9DECmbthvy3XoozeF2yaPnmHiXr@2147483648",
        "DdzFFzCqrht2o3yDwMx9pc6dakRVeACmX8Bu2yvj5umDqsuU6DSx1B9G1RTesPpF1uvkTdyUcoWT3wnTCUcmkun12BGCchnWdFfgkxEL", 1000000);
});

test('Get All wallets information....', () => {
    Wallet.allwallets();
});

test('Get All Accounts information....', () => {
    Wallet.allaccounts();
});

