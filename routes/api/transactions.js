var mongoose = require('mongoose');
var router = require('express').Router();
var Transactions = mongoose.model('Transactions');
//var auth = require('../auth');

router.get('/:trxId', function(req, res, next) {

});


router.get('/fees/:type', function(req, res, next) {

});


router.post('/transfer/:type', function(req, res, next) {

});


module.exports = router;