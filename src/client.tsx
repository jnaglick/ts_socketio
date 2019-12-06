//import { h, render, Component } from 'preact';
const io = require('socket.io-client');

var socket = io();

//const socket = io_client();
const random = Math.random();
console.log(`sending ${random}`)
socket.emit('chat message', `client sez ${Math.random()}`);

socket.on('chat message reply', function(msg){
    console.log(`received from server: ${msg}`);
});