'use strict'

var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app);

app.use(express.static(__dirname + '/demo'));

server.listen(8181);
console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
