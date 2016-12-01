'use strict'

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
