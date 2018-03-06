var mongoose = require('mongoose');
var router = require('express').Router();
var Transactions = mongoose.model('Transactions');
//var auth = require('../auth');

router.get('/:type/:trxId/:email', function(req, res, next) {

});


router.post('/fees/:type', function(req, res, next) {

});


router.post('/transfer/:type', function(req, res, next) {

});


module.exports = router;