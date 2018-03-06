var mongoose = require('mongoose');
var router = require('express').Router();
var WalletApi = mongoose.model('WalletApi');
//var auth = require('../auth');

/**
 * this is auth wallet api.
 */
router.get('/:apiToken', function(req, res, next) {
    res.status(200).json({});
});

module.exports = router;