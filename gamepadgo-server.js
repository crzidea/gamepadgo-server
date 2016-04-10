#!/usr/bin/env node
var WebSocketServer = require('ws').Server
var koa             = require('koa')
var serve           = require('koa-serve')
var net             = require('net')

var app = koa()
app.use(serve('assets'));
var server = app.listen(process.env.PORT_WEB || 8080, () => {
  console.log(`HTTP server listening on port ${server.address().port}`);
})
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
  if (clientIP) {
    var data = JSON.stringify({type: 'client_ip', body: clientIP});
    client.send(data)
  }
});

var tcpServer = net.createServer()
var gopigoClient
var clientIP
tcpServer.on('connection', function(client) {
  gopigoClient = client
  client.on('data', (chunk) => {
    var data = JSON.parse(chunk.toString());
    clientIP = data.body
    console.log(`client from ${clientIP} connected`);
  })
})
tcpServer.on('error', function(error) {
  console.log(error.message)
})

tcpServer.listen(process.env.PORT_PI || 8079, () => {
  console.log(`TCP server listening on port ${tcpServer.address().port}`);
})
