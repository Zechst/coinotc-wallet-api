const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');

let env = dotenv.config({})
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);
var logger = require('./util/logger');  
//logger.debug(env);

var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    compression = require('compression'),
    helmet = require('helmet')

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors());

// Normal express config defaults
app.use(require('morgan')('combined'));
app.use(compression());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

app.use(require('method-override')());
app.use(express.static(__dirname + '/wallet-mgmt-web/dist'));
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({ name: 'coinotcSessionId', secret: process.env.API_SECRET, cookie: { expires: expiryDate }, resave: false, saveUninitialized: false  }));


if (!isProduction) {
  app.use(errorhandler());
}


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    //logger.debug(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.WEB_PORT, function(){
  console.log(' Listening on port ' + server.address().port);
});
