const WebSocket = require('ws');

const ws = new WebSocket('ws://coinotc-ada.ngrok.io'); 

var txn_message_bal = {
    type: 'balance',
    cardanoAddress: 'DdzFFzCqrhsxN8fVwcqCFG4qhLLFBSxvgbe3v5QRkXhH5JoZMXS2AtNC7bboceUWKmagmwPH2McJmyjRaKPxuEEK47Psc36pcw3C3apG',
    walletId: 'Ae2tdPwUPEYydixcsq6iZyHL8nC8oHFU9DECmbthvy3XoozeF2yaPnmHiXr'
};

var txn_message_new = {
    type: 'new',
    passphrase: '123456h67890fsfrdssdcdredsafd432',
    email: 'bunnyppl@gmail.com'
};

var txn_message_fee = {
    type: 'fee',
    fromAddress: "Ae2tdPwUPEYydixcsq6iZyHL8nC8oHFU9DECmbthvy3XoozeF2yaPnmHiXr@2147483648",
    toAddress: "DdzFFzCqrht2o3yDwMx9pc6dakRVeACmX8Bu2yvj5umDqsuU6DSx1B9G1RTesPpF1uvkTdyUcoWT3wnTCUcmkun12BGCchnWdFfgkxEL",
    amount: 1000000
};

/*
	DdzFFzCqrht2Gk3SwXZYgDrydhuBWZ7aWUn35VELgZQXfsPBpzC5vMGZdkDLJGdayUrxqQRg1cScRmyWYqGULR6bt8uv2MhnpyRruftY
*/
var txn_message_transfer = {
    type: 'transfer',
    fromAddress: "Ae2tdPwUPEZELbdGPrCDEXGaPWzNaPZ3NC2EFeSm9ZLSRhKQBthBhoudGVF@2147483648",
    toAddress: "DdzFFzCqrhsheRfCGCRJy3pr1caJBRbUpAmsYsNdb7fcvVfd2fbaRHcT3WtzWhoKqwHrAwHtgB2gHfKFdHDCk8BAQaWL2A19Jsx7RU1X",
    amount: 27000000,
    passphrase: '123456h67890fsfrdssdcdredsafd432'
};
var txn_message_wallets = {
    type: 'wallets'
};

var txn_message_accounts = {
    type: 'accounts'
}

ws.on('open', function open() {
    //ws.send(JSON.stringify(txn_message_bal));
    //ws.send(JSON.stringify(txn_message_fee));
    ws.send(JSON.stringify(txn_message_new));
    //ws.send(JSON.stringify(txn_message_wallets));
    //ws.send(JSON.stringify(txn_message_accounts));
    //ws.send(JSON.stringify(txn_message_transfer));
});

ws.on('message', function incoming(data) {
    
    console.log(data.toString('utf8'));
});