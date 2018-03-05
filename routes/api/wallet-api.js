var mongoose = require('mongoose');
var router = require('express').Router();
var WalletApi = mongoose.model('WalletApi');
//var auth = require('../auth');

router.get('/', function(req, res, next) {
    res.status(200).json({});
});

module.exports = router;