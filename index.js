'use strict'
var codes = require('./codes')
  , self = module.exports

self.stringEncoding = 'utf8'
self.FLOAT_MAX = +3.4e+38
self.FLOAT_MIN = -3.4e+38
self.DOUBLE_MAX = +1.7e+308
self.DOUBLE_MIN = -1.7e+308

self.encodeObject = function(obj){
  if ( Buffer.isBuffer(obj) ) return encodeData(obj)
  if ( typeof obj === 'string' || obj instanceof String ) return encodeString(obj)
  if ( isInteger(obj) ) return encodeInteger(obj)
  if ( isFloat(obj) ) return encodeFloat(obj)
  return encodeNull()
}

function encodeNull(){
  var buffer = new Buffer(1)
  buffer[0] = codes.CODE_NULL
  return buffer
}

function encodeString(str){
  var stringLength = Buffer.byteLength(str, self.stringEncoding)
    , data = new Buffer(stringLength)
  data.write(str, 0, stringLength, self.stringEncoding)
  return encodeData(data, codes.CODE_STRING)
}

function encodeData(data, baseCode){
  var dataLength = data.length
    , header = createObjectHeader(baseCode === undefined ? codes.CODE_DATA : baseCode, dataLength)
  if ( Buffer.isBuffer(header) ){
    return Buffer.concat([ header, data ], header.length + dataLength)
  }
  return null
}

function encodeInteger(num){
  var len = 4
    , buffer = null
    , baseCode = codes.CODE_PINTEGER
  if ( num < 0 ) {
    num = -num
    baseCode = codes.CODE_NINTEGER
  }

  if ( num < 256 ) len = 1
  else if ( num < 65536 ) len = 2

  buffer = new Buffer(1 + len)
  buffer[0] = baseCode + len - 1

  if ( len === 1 ) buffer.writeUInt8(num, 1)
  else if ( len === 2 ) buffer.writeUInt16LE(num, 1)
  else buffer.writeUInt32LE(num, 1)
  return buffer
}

function encodeFloat(fnum){
  var buffer = null
  if ( fnum >= self.FLOAT_MIN && fnum <= self.FLOAT_MAX ) {
    buffer = new Buffer(5)
    buffer[0] = codes.CODE_FSINGLE
    buffer.writeFloatLE(fnum, 1)
  }
  else if ( fnum >= self.DOUBLE_MIN && fnum <= self.DOUBLE_MAX ) {
    buffer = new Buffer(9)
    buffer[0] = codes.CODE_FDOUBLE
    buffer.writeDoubleLE(fnum, 1)
  }
  return buffer
}

function isInteger(num){
  return num === +num && num === (num|0)
}

function isFloat(num){
  return num === +num && num !== (num|0)
}

function createObjectHeader(baseCode, length){
  var header = null
  if ( length < 16 ) {
    header = new Buffer(1)
  }
  else if ( length < 256 ) {
    header = new Buffer(2)
    header.writeUInt8(length, 1)
  }
  else if ( length < 65536 ) {
    header = new Buffer(3)
    header.writeUInt16LE(length, 1)
  }
  else return null
  header[0] = codes.lengthCodeWithBaseLength(baseCode, length)
  return header
}

