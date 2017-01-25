'use strict';
var ent         = require('ent');
var fs          = require('fs');
var app         = require('express')();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);

var redis       = require("redis");

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
        
io.sockets.on('connection', function (socket, pseudo) {

        var sub = redis.createClient();
        var pub = redis.createClient();

        socket.on('message', function (message) {
            message = ent.encode(message);
            pub.publish('allRedisMessages', JSON.stringify({message: message, pseudo: socket.pseudo}));
            console.log("2 : " + socket.pseudo);
        });
   
        sub.on("message", function (channel, message) {    
            socket.emit('redisMessage', {pseudo: JSON.parse(message).pseudo, message: JSON.parse(message).message});
            console.log("3 : " + JSON.parse(message).pseudo);
        });

        socket.on('newclient', function(pseudo) {
            pseudo          = ent.encode(pseudo);
            socket.pseudo   = pseudo;
            socket.broadcast.emit('newclient', pseudo);
            console.log("1 : "+socket.pseudo);
        });

        
        sub.subscribe("allRedisMessages");
        
});

server.listen(8000);
console.log("Magic append on localhost:8000");