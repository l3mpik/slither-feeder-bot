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
var socket = require('socket.io-client')('ws://127.0.0.1:4000');

let perProxy = 3;

if (!!process.env.SLITHER_PER_PROXY) {
    perProxy = parseInt(process.env.SLITHER_PER_PROXY)
}

let skin = ''
let server = ''
let b_name = ''
let gotoX = 0
let gotoY = 0
let alive = 0

const bots = []

let proxies = fs
    .readFileSync(path.join(__dirname, 'proxies.txt'))
    .toString()
    .split(/\r?\n/)
    .filter(function(line) {
        return line.length > 0
    })


process.on('uncaughtException', function(err) {})

function spawn() {

    bots.forEach(function(bot) {
        bot.close()
        console.log('Bot disconnect!');
    });

    alive = 0;

    setTimeout(function() {

        console.log(' Available proxy: ' + proxies.length + '\n Chance to spawn max: ' + proxies.length * perProxy + ' bots' + ' Now: ' + alive + '\n\n\n\n\n\n\n\n');

        proxies.forEach(function(proxy, pidx) {
            for (let i = 0; i < perProxy; i++) {
                const bot = new Bot({
                    name: b_name,
                    reconnect: true,
                    skin: skin,
                    server: server
                })

                bot.on('position', function(position, snake) {
                    snake.facePosition(gotoX, gotoY);
                })

                bot.on('spawn', function() {
                    alive++;
                    socket.emit('bcount', alive);
                })

                bot.on('dead', function() {
                    alive--;
                    socket.emit('bcount', alive);
                })

                bots.push(bot)
                bot.connect(proxy);
            }
        })
    }, 2000);

}




socket.on('pos', function(xx, yy) {

    gotoX = xx;
    gotoY = yy;

});

socket.on('cmd', function(c) {

    bots.forEach(function(bot) {
        const snake = bot.me()
        if (bot.connected && snake) {

            snake.toggleSpeeding(c === 'on')

        }
    })

});

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