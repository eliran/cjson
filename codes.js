var codes = module.exports = {
  CODE_STRING:        0x00
, CODE_DATA:          0x01
, CODE_ARRAY:         0x02
, CODE_DICT:          0x03

, CODE_1LEN:          0x80
, CODE_2LEN:          0x90

, CODE_1BYTE:         0x00
, CODE_2BYTES:        0x01
, CODE_8BYTES:        0x02
, CODE_4BYTES:        0x03

, CODE_PINTEGER:      0xE0
, CODE_NINTEGER:      0xE4
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
