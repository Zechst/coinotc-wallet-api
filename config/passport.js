var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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

function findByApiKey(apikey, fn) {
  WalletApi.findOne({email: email}).then(function(user){
    if(!user || !user.validApiToken(apikey)){
      return done(null, false, {errors: {'Api token ': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}

passport.use(new LocalStrategy(
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