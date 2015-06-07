'use strict'
var common = require('./common')
  , codes = require('./codes')
  , stringEncoding = 'utf8'

module.exports = encodeObject

function encodeObject(obj){
  if ( Buffer.isBuffer(obj) ) return encodeData(obj)
  if ( common.isString(obj) ) return encodeString(obj)
  if ( common.isInteger(obj) ) return encodeInteger(obj)
  if ( common.isFloat(obj) ) return encodeFloat(obj)
  if ( common.isBoolean(obj) ) return encodeBool(obj)
  if ( common.isDate(obj) ) return encodeDate(obj)
  if ( Array.isArray(obj) ) return encodeArray(obj)
  if ( common.isObject(obj) ) return encodeJSObject(obj)
  return encodeNull()
}

function encodeJSObject(obj){
  var encodedJSObject = []
  for (var key in obj){
    if ( obj.hasOwnProperty(key) ) {
      encodedJSObject.push(encodeObject(key))
      encodedJSObject.push(encodeObject(obj[key]))
    }
  }
  var header = createObjectHeader(codes.CODE_DICT, encodedJSObject.length / 2)
  if ( Buffer.isBuffer(header) ){
    encodedJSObject.unshift(header)
    return Buffer.concat(encodedJSObject)
  }
  return null
}

function encodeArray(array){
  var header = createObjectHeader(codes.CODE_ARRAY, array.length)
  if ( Buffer.isBuffer(header) ){
    var allEncodedObjectsLength = 0
      , encodedArrayObjects = array.map(function(obj){
      var encodedObject = encodeObject(obj)
      allEncodedObjectsLength += encodedObject.length
      return encodedObject
    })
    encodedArrayObjects.unshift(header)
    return Buffer.concat(encodedArrayObjects)
  }
  return null
}

function encodeDate(date){
  var buffer = new Buffer(5)
  buffer[0] = codes.CODE_DATE
  buffer.writeUInt32LE(Math.floor(date.getTime() / 1000), 1)
  return buffer
}

function encodeBool(bool){
  return encodeSingleByteCode(bool ? codes.CODE_TRUE : codes.CODE_FALSE)
}

function encodeNull(){
  return encodeSingleByteCode(codes.CODE_NULL)
}

function encodeSingleByteCode(code){
  var buffer = new Buffer(1)
  buffer[0] = code
  return buffer
}

function encodeString(str){
  var stringLength = Buffer.byteLength(str, stringEncoding)
    , data = new Buffer(stringLength)
  data.write(str, 0, stringLength, stringEncoding)
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
  if ( fnum >= common.FLOAT_MIN && fnum <= common.FLOAT_MAX ) {
    buffer = new Buffer(5)
    buffer[0] = codes.CODE_FSINGLE
    buffer.writeFloatLE(fnum, 1)
  }
  else if ( fnum >= common.DOUBLE_MIN && fnum <= common.DOUBLE_MAX ) {
    buffer = new Buffer(9)
    buffer[0] = codes.CODE_FDOUBLE
    buffer.writeDoubleLE(fnum, 1)
  }
  return buffer
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
