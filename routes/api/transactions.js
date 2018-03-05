var mongoose = require('mongoose');
var router = require('express').Router();
var Transactions = mongoose.model('Transactions');
//var auth = require('../auth');

router.get('/transactions', function(req, res, next) {

});

module.exports = router;