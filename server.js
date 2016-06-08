var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var s_port = 4000;

io.on('connection', function(socket) {
    
	console.log('Connection!');
	
    socket.on('pos', function(x, y) {
       
	   io.emit('pos', x, y);

    });

    socket.on('cmd', function(data) {

        if (data == 1) {
            io.emit('cmd', 'on');
        } else {
            io.emit('cmd', 'off');
        }
		
    });

    socket.on('server', function(data) {

            io.emit('server', data);
			console.log(data);
  	
    });


    socket.on('bcount', function(data) {

        //console.log('Bots: ' + data);	
        io.emit('bcount', data);

    })

});


http.listen(s_port, function() {

    console.log("Server Port: " + s_port);

});