'use strict'

require('should')

const JSONStreamCompress = require('../index')
const fixtureJsonEvents = require('./fixtures/event_stream')

const testObj = {
  meaning: 'tempreature',
  path: 'main',
  value: {
    test: 10,
    it: true,
    levelUp: {
      test: 2,
    },
    arr: [
      {a: 1},
      {o: 'value'},
    ],
    number: 3.1000,
  },
}

function getBytes(msg) {
  if (msg instanceof Object) msg = JSON.stringify(msg)
  return Buffer.byteLength(msg)
}

describe('JSONStreamCompress', function() {
  let alice
  let bob
  let encodeDecodeBetweenAliceAndBob

  beforeEach(function() {
    alice = new JSONStreamCompress.Encoder()
    bob = new JSONStreamCompress.Decoder()

    encodeDecodeBetweenAliceAndBob = function(msg) {
      let encodedObj = alice.encode(msg)
      let decodedObj = bob.decode(encodedObj)

      JSON.stringify(msg).should.equal(JSON.stringify(decodedObj))
      return encodedObj.length
    }
  })

  it('should encode and decode an object', function() {
    encodeDecodeBetweenAliceAndBob(testObj)
  })

  it('should encode and decode an array', function() {
    encodeDecodeBetweenAliceAndBob(['a', 1, 2.2])
  })

  it('should encode and decode an nested array', function() {
    encodeDecodeBetweenAliceAndBob([['a', 'b'], [1, 3, [4, 5]]])
  })

  it('should encode and decode an array of objects', function() {
    encodeDecodeBetweenAliceAndBob([{a: 1, b: 2}])
  })

  it('should encode and decode an integer', function() {
    encodeDecodeBetweenAliceAndBob(1)
  })

  it('should encode and decode a float', function() {
    encodeDecodeBetweenAliceAndBob(1.1)
  })

  it('should encode and decode a string', function() {
    encodeDecodeBetweenAliceAndBob('testSting')
  })

  it('should encode and decode a boolean', function() {
    encodeDecodeBetweenAliceAndBob(true)
  })

  it('should encode and decode `null`', function() {
    encodeDecodeBetweenAliceAndBob(null)
  })

  it('should encode and decode multiple objects', function() {
    fixtureJsonEvents.forEach((e) => encodeDecodeBetweenAliceAndBob(e))
  })

  it('should have a compression rate above 65% on the given sample', function() {
    let sizes = fixtureJsonEvents.reduce((p, e) => {
      p.originalSize += getBytes(e)
      p.encodedSize += encodeDecodeBetweenAliceAndBob(e)
      return p
    }, {
      originalSize: 0,
      encodedSize: 0,
    })
    let compressionRate = ((1 - sizes.encodedSize / sizes.originalSize) * 100)
    compressionRate.should.be.above(65)
  })

  it('should not throw an exception, when Bob missed a message from Alice', function() {
    encodeDecodeBetweenAliceAndBob(testObj)
    alice.encode({newKey: 1})
    encodeDecodeBetweenAliceAndBob(Object.assign(testObj)).should.not.throw()
  })

  it('should throw an exception, when Bob missed a message from Alice', function() {
    encodeDecodeBetweenAliceAndBob(testObj)
    alice.encode({newKey: 1})

    encodeDecodeBetweenAliceAndBob.bind(null, Object.assign({}, testObj, {newKey: 2}))
      .should.throw('Can not decode, dict out of sync!')
  })

  it('should throw an exception, when Bob missed a message from Alice (value)', function() {
    encodeDecodeBetweenAliceAndBob(testObj)
    alice.encode('should_be_compressed')

    encodeDecodeBetweenAliceAndBob.bind(null, Object.assign({}, testObj, {meaning: 'should_be_compressed'}))
      .should.throw('Can not decode, dict out of sync!')
  })
})
