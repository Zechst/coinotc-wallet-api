var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var mongoose = require('mongoose');
var WalletApi = mongoose.model('WalletApi');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

function findByApiKey(apikey, done) {
  WalletApi.findOne({token: apikey}).then(function(authInfo){
    if(!authInfo || !authInfo.validApiToken(apikey)){
      return done(null, false, {errors: {'Api token ': 'is invalid'}});
    }
    console.log("Valid >>> " + authInfo);
    return done(null, authInfo);
  }).catch(done);
}

passport.use(new Strategy(
    function(apikey, done) {
      process.nextTick(function () {
        
        findByApiKey(apikey, function(err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'Unknown apikey : ' + apikey }); }
          return done(null, user);
        })
      });
    }
));  