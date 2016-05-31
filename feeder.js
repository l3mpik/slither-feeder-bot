'use strict'

const Bot = require('./dist');
const express = require('express');
const fs = require('fs');
const path = require('path');
var socket = require('socket.io-client')('ws://127.0.0.1:3000');


const bots = []

let perProxy = 2

let server = ''
let gotoX = 0
let gotoY = 0
let alive = 0
let b_name = "";
var _skin = -1


if (!!process.env.SLITHER_PER_PROXY) {
    perProxy = parseInt(process.env.SLITHER_PER_PROXY)
}

let proxies = fs
    .readFileSync(path.join(__dirname, 'proxies.txt'))
    .toString()
    .split(/\r?\n/)
    .filter(function(line) {
        return line.length > 0
    })

process.on('uncaughtException', function(err) {});

function spawn() {

    alive = 0;

    proxies.forEach(function(proxy, pidx) {
        if (proxy == '#SOCKS5'){
		  
		  mode = 'socks';
		  console.log('Change to Socks Proxy');
		  
	  } else if (proxy == '#HTTP'){
		  
		  mode = 'http';
		  console.log('Change to HTTP Proxy');
		  
		  
	  } else if (proxy == '#SOCKS4'){
		  
		  mode = 'socks4';
		  console.log('Change to Socks Proxy');
		  
	  } else {
        for (let i = 0; i < perProxy; i++) {
            const bot = new Bot({
                name: b_name,
                reconnect: true,
                skin: _skin,
                server: server
            })

            bot.on('position', function(position, snake) {
                snake.facePosition(gotoX, gotoY)
            })

            bot.on('spawn', function() {
                alive++;
                socket.emit('bcount', alive);
                console.log('Spawn bot Nick: ' + b_name)
            })

            bot.on('disconnected', function() {
                alive--
                socket.emit('bcount', alive);
                console.log('Bot die');

            })

            bots.push(bot)
            bot.connect(proxy)
        }
	  }
    })
}

function r_s() {


    setInterval(function() {

        _skin = Math.floor((Math.random() * 39) + 1);

    }, 100);
}

function r_s() {
    var ar_name = ['lol', 'l3mpik YT', 'freebots', 'l3mpikYT freebots', 'subscribe', '200bots', 'haha!', 'yariobots.tk'];

    var ar_l = ar_name.length;

    setInterval(function() {

        var rn = Math.floor((Math.random() * ar_l) - 1);

        b_name = ar_name[rn];

    }, 100);
}
socket.on('pos', function(xx, yy) {

    gotoX = xx;
    gotoY = yy;

});

socket.on('cmd', function() {

    bots.forEach(function(bot) {
        const snake = bot.me()
        if (bot.connected && snake) {

            snake.toggleSpeeding('on')

        }
    })

});

socket.on('server', function(data) {

    server = data[0];

    if (data[1] !== "RANDOM") {
        b_name = data[1];
    } else {
        r_n();
    }
    if (data[2] == -1) {
        r_s();
    } else {
        _skin = data[2];
    }

    spawn();

});

console.log('Waiting for client!');
