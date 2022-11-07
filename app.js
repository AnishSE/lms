var createError     = require('http-errors');
var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var cors            = require('cors');
var app             = express();
const wagner        = require('wagner-core');
const helmet        = require('helmet');
var ejsLayouts      = require("express-ejs-layouts");
const cluster       = require('cluster');
const http          = require('http');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var bodyParser  = require('body-parser');
app.use(bodyParser.json({limit: '5000mb',extended: true}));
app.use(bodyParser.urlencoded({limit: '5000mb',extended: true}));
app.options('*', cors())
app.use(function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const mongoose = require('./utils/db')(wagner);

require("./models")(mongoose, wagner);

require('./manager')(wagner);


require('./utils/middlewares')(wagner);

require("./routes")(app, wagner);
app.use(function(req, res, next) {
  next(createError(404));
});

const port = 3002;

app.listen(port, () => console.log(`App listening on port ${port}!`));

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'localhost' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});