var express = require('express');

module.exports = (app, wagner) => {
	app.get('/', (req, res, next)=> {
	  res.send("LMS Apis");
	});
	const users  = require('./users')(app, wagner);
	app.use('/users', users);
}