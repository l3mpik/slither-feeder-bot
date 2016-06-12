'use strict'

////////////////////////////////////////////////////////////
//                                                       //
//     Feeder/server/userscript by l3mpik			     //
///////////////////////////////////////////////////////////

const Bot = require('./dist');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const socket = require('socket.io-client')('ws://127.0.0.1:4000');

process.on('uncaughtException', function(err) {})

let proxies = fs
    .readFileSync(path.join(__dirname, 'proxies.txt'))
    .toString()
    .split(/\r?\n/)
    .filter(function(line) {
        return line.length > 0
    });

let server = '';
let b_name = '';
let skin   = '';
let alive = 0;
let gX = 0;
let gY = 0;

let perProxy = 2;

const bots = [];


function spawn() {

    bots.forEach(function(bot) {
        bot.close()
        console.log('Bot disconnect!');
    });

    alive = 0;
	
	socket.emit('bcount', alive);

    setTimeout(function() {

      
        proxies.forEach(function(proxy, pidx) {
            for (let i = 0; i < perProxy; i++) {
                const bot = new Bot({
                    name: b_name,
                    reconnect: true,
                    skin: skin,
                    server: server
                })

                bot.on('position', function(position, snake) {
                    snake.facePosition(gX, gY);
                })

                bot.on('spawn', function() {
                    alive++;
                    socket.emit('bcount', alive);
					console.log('Available proxy: ' + proxies.length + '\n Chance to spawn max: ' + proxies.length * perProxy + ' bots' + ' Now: ' + alive + '\n\n\n\n\n\n\n\n\n\n\n');
                })

                bot.on('dead', function() {
                    alive--;
                    socket.emit('bcount', alive);
					console.log('Available proxy: ' + proxies.length + '\n Chance to spawn max: ' + proxies.length * perProxy + ' bots' + ' Now: ' + alive + '\n\n\n\n\n\n\n\n\n\n\n');
                })
				
                 bot.on('disconnect', function() {
                    alive--;
                    socket.emit('bcount', alive);
					console.log('Available proxy: ' + proxies.length + '\n Chance to spawn max: ' + proxies.length * perProxy + ' bots' + ' Now: ' + alive + '\n\n\n\n\n\n\n\n\n\n\n');
                })

                bots.push(bot)
                bot.connect(proxy);
				
				  

            }
        })
    }, 1000);

}




socket.on('pos', function(xx, yy) {

    gX = xx;
    gY = yy;

});

socket.on('cmd', function(c) {

    bots.forEach(function(bot) {
        const snake = bot.me()
        if (bot.connected && snake) {

            snake.toggleSpeeding(c === 'on')

        }
    })

});

function r_skin(){
	
setInterval(function(){
	
	i++;
	skin = i;
	if(i == 39) {
		
		i = 0;
		
	}
	
},200);	
	
}

socket.on('server', function(data) {

    server = data[0];
    b_name = data[1];

    if (data[2] == -1) {

        skin = r_skin();
    } else {

        skin = data[2];
    }

    spawn();

});


socket.on('cmd', function(ss) {

    if (ss == 1) {
        bots.forEach(function(bot) {
            const snake = bot.me()
            if (bot.connected && snake) {

                snake.toggleSpeeding(c === 'on');

            }
        });

    }

});


console.log('Waiting for client!');

app.listen(3000)