var codes = module.exports = {
  CODE_STRING:        0x00
, CODE_DATA:          0x01
, CODE_ARRAY:         0x02
, CODE_DICT:          0x03

, SHORT_CODE_MAX:     0x3f

, CODE_1LEN:          0x80
, CODE_2LEN:          0x90

, CODE_1BYTE:         0x00
, CODE_2BYTES:        0x01
, CODE_8BYTES:        0x02
, CODE_4BYTES:        0x03

, CODE_PINTEGER:      0xE0
, CODE_NINTEGER:      0xE4

, MIN_INTEGER_CODE:   0xE0
, MAX_INTEGER_CODE:   0xE7

, CODE_FSINGLE:       0xE8
, CODE_FDOUBLE:       0xE9

, CODE_NULL:          0xF0

, CODE_DSTRING_1BYTE: 0xF1
, CODE_DSTRING_2BYTE: 0xF2

, CODE_DATE:          0xF3
, CODE_DATE_MS:       0xF4

, CODE_FALSE:         0xFE
, CODE_TRUE:          0xFF
}

codes.CODE_SHORT_STRING = (codes.CODE_STRING << 4)
codes.CODE_SHORT_DATA = (codes.CODE_DATA << 4)
codes.CODE_SHORT_ARRAY = (codes.CODE_ARRAY << 4)
codes.CODE_SHORT_DICT = (codes.CODE_DICT << 4)

codes.CODE_STRING_1LEN = (codes.CODE_STRING + codes.CODE_1LEN)
codes.CODE_DATA_1LEN = (codes.CODE_DATA + codes.CODE_1LEN)
codes.CODE_ARRAY_1LEN = (codes.CODE_ARRAY + codes.CODE_1LEN)
codes.CODE_DICT_1LEN = (codes.CODE_DICT + codes.CODE_1LEN)

codes.CODE_STRING_2LEN = (codes.CODE_STRING + codes.CODE_2LEN)
codes.CODE_DATA_2LEN = (codes.CODE_DATA + codes.CODE_2LEN)
codes.CODE_ARRAY_2LEN = (codes.CODE_ARRAY + codes.CODE_2LEN)
codes.CODE_DICT_2LEN = (codes.CODE_DICT + codes.CODE_2LEN)

codes.lengthCodeWithBaseLength = function(baseCode, length){
  if ( length < 16 ) return (baseCode << 4) + length
  if ( length < 256 ) return (baseCode + codes.CODE_1LEN)
  if ( length < 65536 ) return (baseCode + codes.CODE_2LEN)
  return 0x00
}

// Returns [ simpler code, length, data offset ]
codes.extractCodeLength = function(data, dataOffset){
  var code = data[dataOffset]
  if ( code <= codes.SHORT_CODE_MAX ) {
    return [ code >> 4, code & 0xf, 1 ]
  }
  var highCode = code & 0xf0
  if ( highCode === codes.CODE_1LEN ) {
    return [ code & 0xf, data.readUInt8(dataOffset + 1), 2 ]
  }
  else if ( highCode === codes.CODE_2LEN ) {
    return [ code & 0xf, data.readUInt16LE(dataOffset + 1), 3 ]
  }
  if ( code >= codes.MIN_INTEGER_CODE && code <= codes.MAX_INTEGER_CODE ) {
    return [ code & 0xfc, (code & 0x3) + 1, 1 ]
  }
  switch ( code ) {
    case codes.CODE_DATE:
      return [ code, 4, 1 ]
    case codes.CODE_DATE_MS:
      return [ code, 8, 1 ]
  }
  return [ code , 0, 1 ]
}
