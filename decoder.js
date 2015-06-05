var codes = require('./codes')

module.exports = function(data){
  if ( !Buffer.isBuffer(data) || data.length === 0 ) return null
  var decoded = decodeObject(data, 0)
  if ( decoded ) {
    return decoded[0]
  }
  return null
}

// returns: [ decoded object, byte length of object in buffer ]
function decodeObject(data, dataOffset){
  dataOffset = dataOffset || 0
  var codeLength = codes.extractCodeLength(data, dataOffset)
    , dataLength = codeLength[1]
  dataOffset += codeLength[2]
  var retValue = null
  switch ( codeLength[0] ) {
    case codes.CODE_STRING:
      retValue = decodeString(data, dataLength, dataOffset)
      break
    case codes.CODE_DATA:
      retValue = decodeData(data, dataLength, dataOffset)
      break
    case codes.CODE_ARRAY:
      retValue = decodeArray(data, dataLength, dataOffset)
      break
    case codes.CODE_DICT:
      retValue = decodeJSObject(data, dataLength, dataOffset)
      break
    case codes.CODE_PINTEGER:
      retValue = decodeInteger(data, dataLength, dataOffset)
      break
    case codes.CODE_NINTEGER:
      retValue = decodeInteger(data, dataLength, dataOffset)
      retValue[0] = -retValue[0]
      break

    case codes.CODE_FSINGLE:
      retValue = decodeFloat(data, dataOffset)
      break
    case codes.CODE_FDOUBLE:
      retValue = decodeDouble(data, dataOffset)
      break

    case codes.CODE_DATE:
      retValue = decodeDate(data, dataOffset)
      break
    case codes.CODE_TRUE:
      retValue = [ true, 1 ]
      break
    case codes.CODE_FALSE:
      retValue = [ false, 1 ]
      break
    case codes.CODE_NULL:
      retValue = [ null, 1 ]
      break
  }
  if ( retValue ) {
    retValue[1] += codeLength[2]
  }
  else console.log('Code: ',codeLength[0],' Length: ',codeLength[1])
  return retValue
}

function decodeString(data, length, dataOffset){
  return [ data.toString('utf8', dataOffset, dataOffset + length), length ]
}

function decodeData(data, length, dataOffset){
  var retData = new Buffer(length)
  data.copy(retData, 0, dataOffset, dataOffset + length)
  return [ retData, length ]
}

function decodeDate(data, dataOffset){
  var dateInSecondsSince1970 = data.readUInt32LE(dataOffset)
  return [ new Date(dateInSecondsSince1970 * 1000), 4 ]
}

function decodeInteger(data, length, dataOffset){
  switch ( length ) {
    case 1 : return [ data.readUInt8(dataOffset), 1 ]
    case 2 : return [ data.readUInt16LE(dataOffset), 2 ]
    case 4 : return [ data.readUInt32LE(dataOffset), 4 ]
  }
  return [ 0, length ]
}

function decodeFloat(data, dataOffset){
  return [ data.readFloatLE(dataOffset), 4 ]
}

function decodeDouble(data, dataOffset){
  return [ data.readDoubleLE(dataOffset), 8 ]
}

function decodeArray(data, elementsCount, dataOffset){
  var array = []
    , totalLength = 0
  while ( elementsCount-- > 0 ) {
    var decodedObject = decodeObject(data, dataOffset)
    if ( decodedObject === null ) return null
    array.push(decodedObject[0])
    totalLength += decodedObject[1]
    dataOffset += decodedObject[1]
  }
  return [ array , totalLength ]
}

function decodeJSObject(data, elementsCount, dataOffset){
  var jsObject = {}
    , totalLength = 0
  while ( elementsCount-- > 0 ) {
    var decodedKey = decodeObject(data, dataOffset)
    if ( decodedKey === null ) return null
    var decodedValue = decodeObject(data, dataOffset + decodedKey[1])
    if ( decodedValue === null ) return null
    jsObject[decodedKey[0]] = decodedValue[0]
    var length = decodedKey[1] + decodedValue[1]
    totalLength += length
    dataOffset += length
  }
  return [ jsObject , totalLength ]
}
