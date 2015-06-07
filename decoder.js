var codes = require('./codes')
  , Compactor = require('./compactor')

module.exports = function(data, compactor){
  if ( !Buffer.isBuffer(data) || data.length === 0 ) return null
  if ( compactor && !Compactor.isCompactor(compactor) ) {
    compactor = Compactor.create()
  }
  var decoded = decodeObject(data, 0, compactor)
  if ( decoded ) {
    return decoded[0]
  }
  return null
}

var decoderFunctions = {}

decoderFunctions[codes.CODE_TRUE] = function(){ return [ true, 1 ] }
decoderFunctions[codes.CODE_FALSE] = function(){ return [ false, 1 ] }
decoderFunctions[codes.CODE_NULL] = function(){ return [ null, 1 ] }

decoderFunctions[codes.CODE_DATA] = decodeData
decoderFunctions[codes.CODE_FSINGLE] = decodeFloat
decoderFunctions[codes.CODE_FDOUBLE] = decodeDouble
decoderFunctions[codes.CODE_DATE] = decodeDate

decoderFunctions[codes.CODE_ARRAY] = decodeArray
decoderFunctions[codes.CODE_DICT] = decodeJSObject

decoderFunctions[codes.CODE_PINTEGER] = decodeInteger
decoderFunctions[codes.CODE_NINTEGER] = negateDecodeInteger

decoderFunctions[codes.CODE_DSTRING] = decodeDString

// returns: [ decoded object, byte length of object in buffer ]
function decodeObject(data, dataOffset, compactor){
  dataOffset = dataOffset || 0
  var codeLength = codes.extractCodeLength(data, dataOffset)
    , dataLength = codeLength[1]
  dataOffset += codeLength[2]
  var retValue = null
    , retFn = decoderFunctions[codeLength[0]]
  if ( retFn ) {
    retValue = retFn(data, dataLength, dataOffset, compactor)
  }
  else if ( codeLength[0] === codes.CODE_STRING ) {
    retValue = decodeString(data, dataLength, dataOffset)
    if ( compactor ) compactor.compact(retValue[0])
  }
  if ( retValue ) {
    retValue[1] += codeLength[2]
  }
  else console.log('Code: ',codeLength[0],' Length: ',codeLength[1])
  return retValue
}

function decodeDString(data, length, dataOffset, compactor){
  var valueIndex = null
  if ( length === 1 ) valueIndex = data.readUInt8(dataOffset)
  else if ( length === 2 ) valueIndex = data.readUInt16LE(dataOffset)
  if ( valueIndex ) {
    var decodedString = ( compactor && compactor.valueOf(valueIndex) ) || ( '#' + valueIndex.toString() )
    return [ decodedString, length ]
  }
  return null
}

function decodeString(data, length, dataOffset){
  return [ data.toString('utf8', dataOffset, dataOffset + length), length ]
}

function decodeData(data, length, dataOffset){
  var retData = new Buffer(length)
  data.copy(retData, 0, dataOffset, dataOffset + length)
  return [ retData, length ]
}

function decodeDate(data, length, dataOffset){
  var dateInSecondsSince1970 = data.readUInt32LE(dataOffset)
  return [ new Date(dateInSecondsSince1970 * 1000), 4 ]
}

function negateDecodeInteger(data, length, dataOffset) {
  var decodedInteger = decodeInteger(data, length, dataOffset)
  decodedInteger[0] = -decodedInteger[0]
  return decodedInteger
}
function decodeInteger(data, length, dataOffset){
  switch ( length ) {
    case 1 : return [ data.readUInt8(dataOffset), 1 ]
    case 2 : return [ data.readUInt16LE(dataOffset), 2 ]
    case 4 : return [ data.readUInt32LE(dataOffset), 4 ]
  }
  return [ 0, length ]
}

function decodeFloat(data, length, dataOffset){
  return [ data.readFloatLE(dataOffset), 4 ]
}

function decodeDouble(data, length, dataOffset){
  return [ data.readDoubleLE(dataOffset), 8 ]
}

function decodeArray(data, elementsCount, dataOffset, compactor){
  var array = []
    , totalLength = 0
  while ( elementsCount-- > 0 ) {
    var decodedObject = decodeObject(data, dataOffset, compactor)
    if ( decodedObject === null ) return null
    array.push(decodedObject[0])
    totalLength += decodedObject[1]
    dataOffset += decodedObject[1]
  }
  return [ array , totalLength ]
}

function decodeJSObject(data, elementsCount, dataOffset, compactor){
  var jsObject = {}
    , totalLength = 0
  while ( elementsCount-- > 0 ) {
    var decodedKey = decodeObject(data, dataOffset, compactor)
    if ( decodedKey === null ) return null
    var decodedValue = decodeObject(data, dataOffset + decodedKey[1], compactor)
    if ( decodedValue === null ) return null
    jsObject[decodedKey[0]] = decodedValue[0]
    var length = decodedKey[1] + decodedValue[1]
    totalLength += length
    dataOffset += length
  }
  return [ jsObject , totalLength ]
}
