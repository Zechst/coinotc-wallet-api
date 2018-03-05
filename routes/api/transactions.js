var mongoose = require('mongoose');
var router = require('express').Router();
var Transactions = mongoose.model('Transactions');
//var auth = require('../auth');

router.get('/transactions/:trxId', function(req, res, next) {

});


router.get('/transactions/fees/:type', function(req, res, next) {

});


router.post('/transactions/transfer/:type', function(req, res, next) {

});


module.exports = router;