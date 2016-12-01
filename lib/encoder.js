'use strict'

const cbor = require('cbor')

const JSONStreamCompressBase = require('./base')

class JSONStreamCompressEncoder extends JSONStreamCompressBase {
  constructor(opts) {
    super()
    this.arrUpdate =[]
    this.cborEncoder = new cbor.Encoder()
  }

  _add(key) {
    this.arrUpdate.push(key)
    return super._add(key)
  }

  _cborEncode(map) {
    try {
      this.cborEncoder.write(map)
      return this.cborEncoder.read()
    } catch (e) {
      return map
    }
  }

  _compressString(msg) {
    if ((typeof msg === 'string' && msg.length >= 4 && msg.length <= 50)) {
      let valueIndex = this.dict[msg]
      if (!valueIndex) {
        valueIndex = this._add(msg)
      }
      return `${this.valuePrefix}${valueIndex}`
    } else {
      return msg
    }
  }

  _encodeArray(msg) {
    return msg.map((v) => this._encode(v))
  }

  _encode(msg) {
    if (!(msg instanceof Object)) return this._compressString(msg)
    if (msg instanceof Array) return this._encodeArray(msg)

    let map = new Map()

    Object.keys(msg).forEach((k) => {
      let keyIndex = this.dict[k]

      if (!keyIndex && keyIndex !== 0) {
        keyIndex = this._add(k)
      }

      let v = this._compressString(msg[k])

      if (v instanceof Object) {
        if (v instanceof Array) {
          map.set(keyIndex, v.map((e) => this._encode(e)))
        } else {
          map.set(keyIndex, this._encode(v))
        }
      } else {
        map.set(keyIndex, v)
      }
    })
    return map
  }

  _addSyncData(map) {
    map.set(this.syncKey, this.arrUpdate)
    this.arrUpdate = []
    return map
  }

  encode(msg) {
    let map = new Map()
    map.set(this.payloadKey, this._encode(msg))
    if (this.arrUpdate.length) map = this._addSyncData(map)
    return this._cborEncode(map)
  }
}

module.exports = JSONStreamCompressEncoder
