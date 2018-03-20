var RippleWallet = require('../wallet/ripple');
const logger = require('./util/logger');
logger.debug("ripple wallet" + RippleWallet);
var Wallet = new RippleWallet();
logger.debug("ripple wallet" + JSON.stringify(Wallet));

test('create wallet', () => {
    var generatedRippleWallet = Wallet.generate();
    logger.debug(generatedRippleWallet);
});

/*
ADDRESS
rGHXrYhVUrPrK71PgChbCEqCDvR1FiCCB3
SECRET
shv7DjD6oigQV9uQvu3HqsoH9ZWCq
*/
test('get wallet balance', () => {
    Wallet.balance('rGHXrYhVUrPrK71PgChbCEqCDvR1FiCCB3');
});

/*
    rGHXrYhVUrPrK71PgChbCEqCDvR1FiCCB3
    to
    rkWJtcpQZkc6Rmns634Ff3R7pfwzG2xv4
    shv7DjD6oigQV9uQvu3HqsoH9ZWCq

*/
test('transfer fund', () => {
    Wallet.transfer('rGHXrYhVUrPrK71PgChbCEqCDvR1FiCCB3', 'rkWJtcpQZkc6Rmns634Ff3R7pfwzG2xv4', 1000, 'shv7DjD6oigQV9uQvu3HqsoH9ZWCq');
});

test('get wallet destination balance', () => {
    Wallet.balance('rkWJtcpQZkc6Rmns634Ff3R7pfwzG2xv4');
});
