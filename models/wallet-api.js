var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var ApiSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  apitoken: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  salt: String
}, {timestamps: true});

ApiSchema.plugin(uniqueValidator, {message: 'is already taken.'});

ApiSchema.methods.validApiToken = function(token) {
  return this.apitoken === token;
};

ApiSchema.methods.setApiToken = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.apitoken = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

mongoose.model('WalletApi', ApiSchema);