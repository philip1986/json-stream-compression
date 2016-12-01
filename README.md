# JSON-Stream-Compression

JSON is great format to exchange data, but it isn't really efficient when it comes to data volume. This module tries to reduce the data size of each message by caching object keys and certain string values. Further it utilizes [CBOR](http://cbor.io/) to convert objects into compact byte buffers.

This solution is good for data with a repetitive structure that you can't predict ahead of time. There might be better solutions if your data has a fixed structure (e.g.: [Protobuf](https://github.com/dcodeIO/ProtoBuf.js/) or [Avro](https://github.com/jamesbrucepower/node-avro-io))


## Installation
```
npm install json-stream-compression --save
```

### Requirements

- NodeJS 4.x or higher

## Usage

### Server

```JS
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

```

### Client

```JS
const WebSocket = require('ws')
const ws = new WebSocket('ws://localhost:8083')

const Encoder = require('../').Encoder
const sampleData = [
  {device: '878f4dfb-538c-4736-a555-25d7414fcb96', location: 'kitchen', type: 'tempreature', unit: 'C', value: 25.4},
  {device: 'cc51a2eb-912d-4233-b78f-d447794947a0', location: 'office', type: 'noise', unit: 'db', value: 92},
  {device: '878f4dfb-538c-4736-a555-25d7414fcb96', location: 'kitchen', type: 'tempreature', unit: 'C', value: 25.4},
]

ws.on('open', function open() {
  // creates an encoder if the connection gets established
  const encoder = new Encoder()
  sampleData.forEach((d) => ws.send(encoder.encode(d)))
})
```

__Note:__ The encoder and decoder have a synced state! This means messages must be decoded in the same order as they are encoded and loss of messages is not acceptable. In example the message transfer is done via WebSockets which are based on TCP. TCP guarantees exactly-once delivery and in-order delivery. But in any case if the connection breaks the encoder and decoder should be re-instantiated.

## Limitations

- Only n to 1 messaging, a decoder instance can only handle messages from a single encoder instance
- Only works if message delivery is ensured and messages arrive in order
- Also keep in mind there are minimum payload sizes (e.g.: 46 Byte for TCP), so it might be not beneficial not make small messages smaller
- If data doesn't have to be transferred in realtime, it could make more sense to batch them and use something like GZIP for compression  
