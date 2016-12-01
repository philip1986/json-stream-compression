'use strict'

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({port: 8083}, function() {
  console.log('WS server is up and running')
})

const Decoder = require('../').Decoder

wss.on('connection', function connection(ws) {
  // creates a new decoder for each connection
  const decoder = new Decoder()
  ws.on('message', function incoming(message) {
    message = decoder.decode(message)
    console.log(message)
  })
})
