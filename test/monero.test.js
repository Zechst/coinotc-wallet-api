var MoneroWallet = require('../wallet/monero');
var Wallet = new MoneroWallet('localhost', 7879);
const Util = require('../util');
const logger = require('./util/logger');
const utils = new Util();

var crypto = require("crypto");
var payment_id = crypto.randomBytes(8).toString('hex');
/*
    chaindata directory is where the entire blockchain ledgers are.
    
    ./monero-wallet-rpc --log-level 0 --testnet --disable-rpc-login --wallet-dir ./chaindata/ --rpc-bind-ip 127.0.0.1 --rpc-bind-port 7878 --daemon-address 127.0.0.1:28081 --trusted-daemon

    ./monero-wallet-rpc --log-level 0 --testnet --disable-rpc-login --wallet-dir ./chaindata/ --rpc-bind-ip 127.0.0.1 --rpc-bind-port 7878 --daemon-address testnet.node.xmrlab.com:28081 --trusted-daemon

    ./monerod --testnet --data-dir ./chaindata/ --testnet-rpc-bind-port 28081 --log-level 4

    https://dis.gratis/

    ./monero-wallet-rpc --wallet-file /home/kenneth/Monero/wallets/kenneth/kenneth --daemon-address localhost:18081 --password qawsedrf%T1 --rpc-bind-ip 127.0.0.1 --rpc-bind-port 7879 --disable-rpc-login

    ./monerod --data-dir ./chaindata/ --log-level 0


    https://phloatingman.com/monero-testnet-live/

    https://lafudoci.gitbooks.io/monero-xmr/content/full-monero-client-cli.html

    sudo apt-get install build-essential cmake pkg-config libboost-all-dev libssl-dev libzmq3-dev libunbound-dev libsodium-dev libminiupnpc-dev libunwind8-dev liblzma-dev libreadline6-dev libldns-dev  libexpat1-dev libgtest-dev doxygen graphviz

    behind nostril cease opposite deftly cage pouch sniff
    leisure situated oozed biology cuisine orchid oaks push
    goblet january habitat tribal pepper juvenile lower masterful leisure

    9uXvHZD6fZG9sRWfKHE683hEk9wyS2MotP19d46veHLLHZC8LWMj9hJbvjvr2w25HM6SWRx9yaG9gfXFVCieUNZUSpbQA9A
    viewkey
    secret: 5f06e87a0d28307413031027b0859a47f4a532c733420c8d9e1cb904dedd880b
    public: f9df8d30e00071d0cfedee1cb2fc2c2085b7f042371d7be64e27330f25d437e4
    spendkey
    secret: 1fc044907ff708f4ba2976b1b6a4257f30b55ff94b286d17d75345c71de5a103
    public: 3e73fb3fae24af3506c2dedb489794f08fa473f5faefa7838b7357de9e6b9962

    ./monero-wallet-rpc --testnet --daemon-address 127.0.0.1:28081 --wallet-dir ./wallets/ --disable-rpc-login --rpc-bind-port 7879 --rpc -bind-ip 127.0.0.1

    ./monerod --testnet --data-dir /media/kenneth/b13ae9f7-5727-4bc0-94fe-77d72079f2ee/monero-data-test

    ./monero-wallet-rpc --testnet --daemon-address 127.0.0.1:28081 --wallet-dir /media/kenneth/b13ae9f7-5727-4bc0-94fe-77d72079f2ee/monero-data-test/wallet --disable-rpc-login --rpc-bind-port 7879 --rpc-bind-ip 127.0.0.1
*/

var firstWallet = "";
var secondWallet = "";

test('create wallet', () => {
    firstWallet = utils.makeid();
    logger.debug("firstWallet>>> " + firstWallet);
    Wallet.createWallet(firstWallet, 'mytestpassword', 'English').then(function(result){
        logger.debug("firstWallet >> address >> " + JSON.stringify(result));
        logger.debug(Wallet.address());
    });
});

/*
test('open wallet dev1', () => {
    Wallet.openWallet('dev1', 'password@123').then(result => {
        logger.debug("open wallet !!! -> " + JSON.stringify(result));
        Wallet.balance().then(availBalance=>{
            logger.debug("dev1 ->"+ availBalance);
        }).catch(function(e){
            logger.debug(e);
        });
    });
});


test('open wallet dev2', () => {
    Wallet.openWallet('dev2', 'password@123').then(result => {
        logger.debug("open wallet -> " + JSON.stringify(result));
        Wallet.balance().then(availBalance=>{
            logger.debug("dev2 ->"+ availBalance);
        }).catch(function(e){
            logger.debug(e);
        });
    });
});
*/
/*
test('create second wallet', () => {
    secondWallet = utils.makeid();
    Wallet.createWallet(secondWallet, 'mytestpassword', 'English').then(function(result){
        logger.debug(result);
    });
    logger.debug(Wallet.address());
});

test('show both wallet', () => {
    logger.debug("first -> " + firstWallet);
    logger.debug("second -> " + secondWallet);
});


test('Add to Wallet Address Book', () => {
    logger.debug("first -> " + firstWallet);
    logger.debug("second -> " + secondWallet);
    Wallet.openWallet(firstWallet, 'mytestpassword').then(function(result) {
        logger.debug(result);
        Wallet.address().then(function(firstWalletAddress) {
            logger.debug(firstWalletAddress);
            let x = firstWalletAddress;
            Wallet.addAddressBook(x, 'first wallet ...').then(function(result) {
                logger.debug(result);
                Wallet.getAddressBook([result.index]).then(result => {
                    logger.debug(">>> " + JSON.stringify(result));
                });
            });
        });
    });
   
    Wallet.openWallet(secondWallet, 'mytestpassword').then(function(result) {
        logger.debug(result);
        Wallet.address().then(secondWalletAddress => {
            logger.debug(">> 2nd" + JSON.stringify(secondWalletAddress));
            let y = secondWalletAddress;
            Wallet.addAddressBook(y, 'second wallet ...').then(function(addedAddress) {
                logger.debug(addedAddress);
                Wallet.getAddressBook([]).then(result => {
                    logger.debug(">>> " + JSON.stringify(result));
                });
            });
        });
    });
});
*/

/*
test('Get balance', () => {
    Wallet.openWallet('wallet', '').then(function(result) {
        Wallet.balance().then(availBalance=>{
            logger.debug(availBalance);
        });
    });
});*/

/*
test('Get balance', () => {
    Wallet.openWallet('kenneth', 'qawsedrf%T1').then(function(result) {
        Wallet.balance().then(availBalance=>{
            logger.debug(availBalance);
        });
    });
});

test('Get balance without password', () => {
    Wallet.openWallet('kenneth', '').then(function(result) {
        logger.debug(result);
        if(result.code > 0){
            Wallet.balance().then(availBalance=>{
                logger.debug(availBalance);
            });
        }else{
            logger.debug("Error open wallet!")
        }
        
    });
});

test('Make integrated address', () => {
    Wallet.openWallet('kenneth', 'qawsedrf%T1').then(function(result) {
        logger.debug(payment_id);
        Wallet.integratedAddress(payment_id).then(integratedAddress=>{
            logger.debug(integratedAddress);
        });
    });
});*/


//12182434718387696
//80000000000
//7000000000000
//12182.437718387695
// 9zx5b2XLrzQFeHuzmpmY36DGHfCw9AmZJg8j2KN3Q66EhCo2wedNreQVDWhX1GnBvJZbPqK8TVYFvXhqdFsJv3ZG9BaAtyc
// 9yhHFUUZeARW6ecyHJe2ZARrWEHnifGLQK8tvKZVccVYNoeRKQp8rfDXGzWaJuGT4m3diT8gHGww9B5vwW92m2k91iMJTPM
// 8744e27139110ef2b06bb0f22b683502f51ff3f9674f97ca98c0f3d19cb8a2e0
// d010f463c4851596539f7ce6bbc923d5696b3d5c6642187054eca622649c5411

/*
test('Transfer fund from wallet to wallet', () => {
    Wallet.openWallet('dev1', 'password@123').then((result)=> {
        
        var destination = {
            address: '9ttjmq7iYB3VPAG36CcfFJjhyiW5eDTXRGyj84NGQq262NCU3r4mJPnc9jc4TZSwZoSCB54aiNpzSP1F3wTXm8SrFMg4bFa',
            amount: 1
        }
        var arrDest = [];
        arrDest.push(destination);
        logger.debug("........");
        Wallet.transfer(arrDest).then(function(xferResult){
            logger.debug("transfer3 ....");
            logger.debug(xferResult);
        }).catch((error)=>{
            logger.debug("xfer error "+ error);
        });
    });
});*/

//Kdibp s90O5
// A1ZfaxTk4Jmg9o81kgfFYMEUkq7Sm9AJajSU2m7P9a3LPZs9g474A6y2UPoCroidB4PHe8g5UonTZBqVfN1nQh3U7V3uUcn
/*
test('Get balance 2', () => {
    Wallet.openWallet('s90O5', 'mytestpassword').then(function(result) {
        Wallet.balance().then(availBalance=>{
            logger.debug(availBalance);
            Wallet.stopWallet();
        });
    });
});*/

/*
logger.debug wallet/monero.js:20
    { filename: '9XPsl',
      password: 'mytestpassword',
      language: 'English' }
9ue6oCyD2wHduF348C1vkseW4zKiBF2HwZ3miyc5dqqgB7bNRF2HMFx5PG45CnWHaJ7ifzo1U5ubsaS3MNWR16HPSTLavmD
  logger.debug wallet/monero.js:20
    { filename: 'vurdM',
      password: 'mytestpassword',
      language: 'English' }
A2SqbedaTfx3veJCMLgrCmKpaqcMg1P2w2DxMphsDJZS56iyE8YXnwxAXtDniHgUn7W9ruVf1cS5rTXyVVUiEfQ5VYaz3nx
*/

