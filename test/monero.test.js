var MoneroWallet = require('../wallet/monero');
var Wallet = new MoneroWallet('localhost', 7878);
const Util = require('../util');
const utils = new Util();
/*
    chaindata directory is where the entire blockchain ledgers are.
    
    ./monero-wallet-rpc --log-level 0 --testnet --disable-rpc-login --wallet-dir ./chaindata/ --rpc-bind-ip 127.0.0.1 --rpc-bind-port 7878 --daemon-address 127.0.0.1:28081 --trusted-daemon

    ./monerod --testnet --data-dir ./chaindata/ --testnet-rpc-bind-port 28081 --log-level 4
*/
var firstWallet = "";
var secondWallet = "";

test('create wallet', () => {
    firstWallet = utils.makeid();
    console.log("firstWallet>>> " + firstWallet);
    Wallet.createWallet(firstWallet, 'mytestpassword', 'English').then(function(result){
        console.log("firstWallet >> address >> " + JSON.stringify(result));
        console.log(Wallet.address());
    });
});


test('open wallet', () => {
    Wallet.openWallet(firstWallet, 'mytestpassword').then(result => {
        console.log("open wallet -> " + JSON.stringify(result));
    });
});

test('create second wallet', () => {
    secondWallet = utils.makeid();
    Wallet.createWallet(secondWallet, 'mytestpassword', 'English').then(function(result){
        console.log(result);
    });
    console.log(Wallet.address());
});

test('show both wallet', () => {
    console.log("first -> " + firstWallet);
    console.log("second -> " + secondWallet);
});


test('Add to Wallet Address Book', () => {
    console.log("first -> " + firstWallet);
    console.log("second -> " + secondWallet);
    Wallet.openWallet(firstWallet, 'mytestpassword').then(function(result) {
        console.log(result);
        Wallet.address().then(function(firstWalletAddress) {
            console.log(firstWalletAddress);
            let x = firstWalletAddress;
            Wallet.addAddressBook(x, 'first wallet ...').then(function(result) {
                console.log(result);
                Wallet.getAddressBook([result.index]).then(result => {
                    console.log(">>> " + JSON.stringify(result));
                });
            });
        });
    });
   
    Wallet.openWallet(secondWallet, 'mytestpassword').then(function(result) {
        console.log(result);
        Wallet.address().then(secondWalletAddress => {
            console.log(">> 2nd" + JSON.stringify(secondWalletAddress));
            let y = secondWalletAddress;
            Wallet.addAddressBook(y, 'second wallet ...').then(function(addedAddress) {
                console.log(addedAddress);
                Wallet.getAddressBook([]).then(result => {
                    console.log(">>> " + JSON.stringify(result));
                });
            });
        });
    });
});

test('Get balance', () => {
    Wallet.openWallet('wallet', '').then(function(result) {
        Wallet.balance().then(availBalance=>{
            console.log(availBalance);
        });
    });
});


//12182434718387696
//80000000000
//7000000000000
//12182.437718387695
test('Transfer fund ', () => {
    Wallet.openWallet('wallet', '').then(function(result) {
        Wallet.balance().then(availBalance=>{
            console.log(availBalance);
            var destination = {
                address: 'A1ZfaxTk4Jmg9o81kgfFYMEUkq7Sm9AJajSU2m7P9a3LPZs9g474A6y2UPoCroidB4PHe8g5UonTZBqVfN1nQh3U7V3uUcn',
                amount: 100000000
            }
            var arrDest = [];
            arrDest.push(destination);
            Wallet.transfer(arrDest).then(function(xferResult){
                console.log("transfer3 ....");
                console.log(xferResult);
            }).catch((error)=>{
                console.log("xfer error "+ error);
            });
        });
    });
});

//Kdibp s90O5
// A1ZfaxTk4Jmg9o81kgfFYMEUkq7Sm9AJajSU2m7P9a3LPZs9g474A6y2UPoCroidB4PHe8g5UonTZBqVfN1nQh3U7V3uUcn
/*
test('Get balance 2', () => {
    Wallet.openWallet('s90O5', 'mytestpassword').then(function(result) {
        Wallet.balance().then(availBalance=>{
            console.log(availBalance);
            Wallet.stopWallet();
        });
    });
});*/