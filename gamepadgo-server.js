#!/usr/bin/env node
var WebSocketServer = require('ws').Server
var koa             = require('koa')
var serve           = require('koa-serve')
var net             = require('net')

var app = koa()
app.use(serve('assets'));
var server = app.listen(8080)
var wsServer = new WebSocketServer({ server: server })

wsServer.on('connection', function connection(client) {
  //var location = url.parse(client.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or client.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  client.on('message', function incoming(message) {
    console.log('received: %s', message);
    if (!gopigoClient) {
      return
    }
    gopigoClient.write(message)
    gopigoClient.write(String.fromCharCode(0))
  });
});

var tcpServer = net.createServer()
tcpServer.listen(8079)
var gopigoClient
tcpServer.on('connection', function(client) {
  gopigoClient = client
})
tcpServer.on('error', function(error) {
  console.log(error.message)
})
