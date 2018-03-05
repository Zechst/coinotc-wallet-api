var EthereumWallet = require('../wallet/ethereum');
var ethers = require('ethers');
var Wallet = new EthereumWallet();
console.log("eth wallet" + Wallet);
/*
geth --datadir=/media/kenneth/b13ae9f7-5727-4bc0-94fe-77d72079f2ee/eth/.rinkeby console --ethstats='kenken6443443:Respect my authoritah!@stats.rinkeby.io' --networkid=4 --rinkeby --rpc --rpcapi="db,eth,net,web3,personal,web3" console
*/
test('create wallet', () => {
     Wallet.createWallet('testpassword@432').then(result => {
         console.log("result" + result);
     });
});

test('check wallet balance', () => {
    Wallet.createWallet('testpassword@123').then(result => {
        console.log(result.privateKey);
        console.log(result.address);
        console.log('<>>>');
        Wallet.balance(result.privateKey).then(bal => {
            console.log("1. balance -> result - > " + bal);
        }).catch(error => { console.error('caught', error); });     
    });
});

/*
{ privateKey: '0xf63ad040311ce9d6ffe56cbf3c284e5fa5535fcd7149cccc157bc485faa6eed5',
      mnemonic: 'mother almost gun coach point mule waste edit valve misery off effort',
      address: '0x52FFf86B65893DDF85C4f6C16c13C8b024A651BB' }
*/
test('check source wallet balance', () => {
     Wallet.balance('0xf63ad040311ce9d6ffe56cbf3c284e5fa5535fcd7149cccc157bc485faa6eed5').then(bal => {
         console.log("2. balance -> result - > " + bal);
     }).catch(error => { console.error('caught', error); });     
});

/*
{ privateKey: '0xbeae58f4ff545bd10fead52710c06369c9355aac2407628ffd05a0c16a4232f9',
      mnemonic: 'slogan scare major material fun cloud merge document piano chunk hire slender',
      address: '0xC24E24a083C2A7B00c94e2B5D14De3B7ED39d8c1' }
*/
test('check destination wallet balance', () => {
     Wallet.balance('0xbeae58f4ff545bd10fead52710c06369c9355aac2407628ffd05a0c16a4232f9').then(bal => {
         console.log("3. balance -> result - > " + bal);
     }).catch(error => { console.error('caught', error); });     
});

// 6cf90d2e7e3b64561cad58cba178ff128797cba06a6341747c45b639d38b3a97
// 0xC0A7f66bBC15B29B174222cFb3Ed1706e0D83A37
test('check etherbase account', () => {
     Wallet.balance('0x6cf90d2e7e3b64561cad58cba178ff128797cba06a6341747c45b639d38b3a97').then(bal => {
         console.log("4. balance -> result - > " + bal);
         console.log("In ETH > " + ethers.utils.formatEther(bal, {}));
         console.log("Typeof In ETH > " + typeof (ethers.utils.formatEther(bal, {})));
     }).catch(error => { console.error('caught', error); });     
});

// to 0xC24E24a083C2A7B00c94e2B5D14De3B7ED39d8c1
// from private key 0x6cf90d2e7e3b64561cad58cba178ff128797cba06a6341747c45b639d38b3a97
//1000000000000000000
test('Transfer from one acc to another', () => {
        Wallet.transfer('0xC0A7f66bBC15B29B174222cFb3Ed1706e0D83A37', 1000000000000000000, '0xbeae58f4ff545bd10fead52710c06369c9355aac2407628ffd05a0c16a4232f9').then(transactionHash => {
            console.log("5. transfer -> acc to acc - > " + JSON.stringify(transactionHash));
        }).catch(error => { console.error('caught', error); });
});

/*
test('Transfer from one acc to another', () => {
    Wallet.transfer('0xC24E24a083C2A7B00c94e2B5D14De3B7ED39d8c1', 1000000000000000000, '0x6cf90d2e7e3b64561cad58cba178ff128797cba06a6341747c45b639d38b3a97').then(transactionHash => {
        console.log("5. transfer -> acc to acc - > " + JSON.stringify(transactionHash));
    }).catch(error => { console.error('caught', error); });
});*/