'use strict'

const Bot = require('./dist');
const express = require('express');
const fs = require('fs');
const path = require('path');
var   socket = require('socket.io-client')('ws://127.0.0.1:3000');


const bots = []

let perProxy = 2

let server = ''
let gotoX = 0
let gotoY = 0
let alive = 0
let b_name = "";
var _skin = -1


if(!!process.env.SLITHER_PER_PROXY) {
  perProxy = parseInt(process.env.SLITHER_PER_PROXY)
}

let proxies = fs
  .readFileSync(path.join(__dirname, 'proxies.txt'))
  .toString()
  .split(/\r?\n/)
  .filter(function(line) { return line.length > 0 })

process.on('uncaughtException', function(err) { console.log(err) });

function spawn() {
 
 alive = 0;
 
  proxies.forEach(function(proxy, pidx) {
    for(let i = 0; i < perProxy; i++) {
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
        alive++
		socket.emit('bcount', alive);
        console.log('Spawn bot Nick: ' + b_name)
      })

      bot.on('disconnected', function() {
        alive--
		socket.emit('bcount', alive);
		console.log('Bot die');
		bot.connect(proxy)
		
      })

      bots.push(bot)
      bot.connect(proxy)
    }
  })
}

function r_s()
{
	
	
	setInterval(function(){
		
		_skin =  Math.floor((Math.random() * 39) + 1);
		
	},100);
}

socket.on('pos', function(xx,yy){
	
  gotoX = xx;
  gotoY = yy;
  
});

socket.on('cmd', function(){
	
	bots.forEach(function(bot) {
    const snake = bot.me()
    if(bot.connected && snake) {
	    
      snake.toggleSpeeding('on')
 
	}
  })
	
});

socket.on('server', function(data){
	
	server = data[0];
	b_name = data[1];
	
	if(data[2]== -1)
	{
	r_s();
	}
	else
	{
	_skin  = data[2];
	}
	
	spawn();
	
});

console.log('Waiting for client!');
