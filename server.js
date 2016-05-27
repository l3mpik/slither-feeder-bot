var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var s_port = 3000;


io.on('connection', function(socket) {
    
	console.log('Connection!');
	
    socket.on('pos', function(x, y) {
       
	   io.emit('pos', x, y);
       
    });
    
	socket.on('server', function(data) {

            io.emit('server', data);
			
			console.log('Bots name:' + data[1]);
			
    });
	
    socket.on('cmd', function() {

            io.emit('cmd', 1);
 
    });

    socket.on('bcount', function(data) {

        io.emit('bcount', data);

    })

});


http.listen(s_port, function() {

    console.log("Server Port: " + s_port);

});