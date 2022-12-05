var express = require('express');
const { callbackify } = require('util');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
const process = require('process');
const { connect } = require('http2');
var robot = require('robotjs');

connections = [];
var loggedOff = [];

server.listen(process.env.PORT || 3000);
console.log('AirController server is running...')
let current = new Date()
var message = `[*] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) - AirController has started\n`
fs.appendFile('history.txt', message, function(err, data) {
    if (err) {
        return console.log(err);
    }
});

io.sockets.on('connection', function(socket) {
    var address = socket.handshake;
    connections.push(socket)
    let current = new Date()
    let message = `[i] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) | ${address.address.replace('::ffff:', '')} (${socket.id}) - Is connected\n`
    fs.appendFile('history.txt', message, function(err, data) {
        if (err) {
            return console.log(err);
        }
    });

    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1);
        var address = socket.handshake;
        let current = new Date()
        let message = `[i] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) | ${address.address.replace('::ffff:', '')} (${socket.id}) - Is disconnected\n`
        fs.appendFile('history.txt', message, function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
    });

    socket.on('NodeJS Server Port', function(data) {
        if (data == "left") {
            var mouse = robot.getMousePos()
            robot.moveMouseSmooth(mouse.x - 5, mouse.y, 20)
        } else if (data == "right") {
            var mouse = robot.getMousePos()
            robot.moveMouseSmooth(mouse.x + 5, mouse.y, 20)
        } else if (data == "up") {
            var mouse = robot.getMousePos()
            robot.moveMouseSmooth(mouse.x, mouse.y - 5, 20)
        } else if (data == "down") {
            var mouse = robot.getMousePos()
            robot.moveMouseSmooth(mouse.x, mouse.y + 5, 20)
        } else if (data == "Confirm") {
            var mouse = robot.getMousePos()
            var hex = robot.getPixelColor(mouse.x, mouse.y);
            io.sockets.emit("ReturnPort", { 'msg': `#${hex}` });
        } else if (data == "Cancel") {
            io.sockets.emit("ReturnPort", { 'msg': "Settings" })
        } else if (data == "Left") {
            robot.keyTap('a')
        } else if (data == "Right") {
            robot.keyTap('d')
        } else if (data == "Up") {
            robot.keyTap('w')
        } else if (data == "Down") {
            robot.keyTap('s')
        } else if (data == "Center") {
            io.sockets.emit("ReturnPort", { 'msg': 'AirController Ready' })
        } else if (data == "Back") {
            io.sockets.emit("ReturnPort", { 'msg': "Back" })
        } else if (data == "Next") {
            io.sockets.emit("ReturnPort", { 'msg': "Next" })
        }
    });
})