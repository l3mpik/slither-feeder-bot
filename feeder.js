'use strict'

const Bot = require('./dist');
const express = require('express');
const fs = require('fs');
const path = require('path');
var   socket = require('socket.io-client')('ws://127.0.0.1:3000');

let perProxy = 2

if(!!process.env.SLITHER_PER_PROXY) {
  perProxy = parseInt(process.env.SLITHER_PER_PROXY)
}

let skin = -1
let server = ''
let gotoX = 0
let gotoY = 0
let b_name = ''
let alive = 0

const bots = []

let proxies = fs
  .readFileSync(path.join(__dirname, 'proxies.txt'))
  .toString()
  .split(/\r?\n/)
  .filter(function(line) { return line.length > 0 })

process.on('uncaughtException', function(err) { console.log(err) })

function spawn() {
  
  proxies.forEach(function(proxy, pidx) {
    for(let i = 0; i < perProxy; i++) {
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
		console.log(' Available proxy: ' + proxies.length + '\n Chance to spawn max: ' + proxies.length * perProxy + ' bots' + ' Now: ' + alive + '\n\n\n\n\n\n\n\n');
		socket.emit('bcount', alive);
      })

      bot.on('disconnected', function() {
        alive--;
		socket.emit('bcount', alive);
      })

      bots.push(bot)
      bot.connect(proxy);
    }
  })
}


const app = express();

socket.on('pos', function(xx,yy){
	
  gotoX = xx;
  gotoY = yy;
  
});

socket.on('cmd', function(c){
	
	bots.forEach(function(bot) {
    const snake = bot.me()
    if(bot.connected && snake) {
	    
      snake.toggleSpeeding(c === 'on')
 
	}
  })
	
});

socket.on('server', function(data){
	
	server = data;
	skin = 1;	
	spawn();
	
});

socket.on('bname',function(data){
	
b_name = data;
	
});

socket.on('off',function(){
	
	bots.forEach(function(bot) {
    const snake = bot.me()
    if(bot.connected && snake) {
	    
      snake.toggleSpeeding(c === 'on')
 
	}
  })
	
});

console.log('Waiting for client!');

app.listen(1337)
