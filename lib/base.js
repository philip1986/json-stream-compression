'use strict'

class JSONStreamCompressBase {
  constructor() {
    this.payloadKey = -1
    this.syncKey = -2
    this.valuePrefix = String.fromCharCode(31)
    this.dict = {}
    this.arr = []
    this.SYNC_ERROR = new Error('Can not decode, dict out of sync!')
  }

  _add(key) {
    let index = this.arr.push(key) - 1
    this.dict[key] = index
    return index
  }
}

module.exports = JSONStreamCompressBase
