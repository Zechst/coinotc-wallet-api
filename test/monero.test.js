var MoneroWallet = require('../wallet/monero');
var Wallet = new MoneroWallet('localhost', 7878);
/*
    ./monero-wallet-rpc --log-level 0 --testnet --disable-rpc-login --wallet-dir ./chaindata/ --rpc-bind-ip 127.0.0.1 --rpc-bind-port 7878 --daemon-address 127.0.0.1:28081 --trusted-daemon
*/
var firstWallet = "";
var secondWallet = "";

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

test('create wallet', () => {
    firstWallet = makeid();
    Wallet.createWallet(firstWallet, 'mytestpassword', 'English').then(function(result){
        console.log(result);
    });
    console.log(Wallet.address());
});


test('open wallet', () => {
    Wallet.openWallet(firstWallet, 'mytestpassword').then(result => {
        console.log(result);
    });
});

test('create second wallet', () => {
    secondWallet = makeid();
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
