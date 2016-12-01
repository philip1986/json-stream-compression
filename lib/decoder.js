'use strict'

const cbor = require('cbor')

const JSONStreamCompressBase = require('./base')

class JSONStreamCompressDecoder extends JSONStreamCompressBase {
  constructor() {
    super()
    this.valuePrefixRegEx = new RegExp(this.valuePrefix)
    this.cborDecoder = new cbor.Decoder()
  }

  _cborDecode(msg) {
    const parser = this.cborDecoder._parse()
    this.cborDecoder.write(msg)
    let state = parser.next()
    let res
    while (!state.done) {
      res = this.cborDecoder.read(state.value)
      state = parser.next(res)
    }
    return res
  }

  _decodeValue(v) {
    if (typeof v === 'string' && this.valuePrefixRegEx.test(v)) {
      v = this.arr[v.slice(1)]
      if (v === undefined) throw this.SYNC_ERROR
    }

    if (v instanceof Array) return v.map((e) => this._decode(e))
    if (v instanceof Object) return this._decode(v)
    return v
  }

  _syncDict(map) {
    if(map.has(this.syncKey)) {
      map.get(this.syncKey).forEach((k) => {
        if(!this.dict[k]) this._add(k)
      })
      map.delete(this.syncKey)
    }
    return map
  }

  _getPayload(msg) {
    if(msg.has(this.payloadKey)) {
      msg = msg.get(this.payloadKey)
    }
    return msg
  }

  _decode(msg) {
    if(!(msg instanceof Map)) return this._decodeValue(msg)

    let obj = {}

    msg.forEach((v, k) => {
      k = this.arr[k]
      if (!k) throw this.SYNC_ERROR
      obj[k] = this._decodeValue(v)
    })

    return obj
  }

  decode(msg) {
    if (msg instanceof Buffer) msg = this._cborDecode(msg)
    msg = this._syncDict(msg)
    msg = this._getPayload(msg)
    return this._decode(msg)
  }
}

module.exports = JSONStreamCompressDecoder
