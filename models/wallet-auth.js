var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var ApiSchema = new mongoose.Schema({
  appname: {type: String, unique: true, required: [true, "can't be blank"], index: true},
  token: {type: String, required: [true, "can't be blank"]},
  salt: String
}, {timestamps: true});

ApiSchema.plugin(uniqueValidator, {message: 'is already taken.'});

ApiSchema.methods.validApiToken = function(_token) {
  return this.token === _token;
};

ApiSchema.methods.setApiToken = function(keyToken){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.token = crypto.pbkdf2Sync(keyToken, this.salt, 10000, 32, 'sha512').toString('hex');
};

mongoose.model('WalletApi', ApiSchema);