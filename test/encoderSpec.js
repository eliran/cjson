var expect = require('expect.js')
var cjson  = require('../index')
var codes  = require('../codes')
var common = require('../common')

describe("objects encoder",function(){
  describe("string encoder",function(){
    it("should encode short strings (below 16 bytes) with CODE_SHORT_STRING",function(){
      testShortString(generateStringWithLength(15))
      testShortString(generateStringWithLength(4))
      testShortString(generateStringWithLength(0))
    })

    it("should encode strings with upto 255 bytes with CODE_STRING_1LEN",function(){
      testEncodeString(16, codes.CODE_STRING_1LEN, 1)
      testEncodeString(255, codes.CODE_STRING_1LEN, 1)
    })

    it("should encode strings with upto 65535 bytes with CODE_STRING_2LEN",function(){
      testEncodeString(256, codes.CODE_STRING_2LEN, 2)
      testEncodeString(65535, codes.CODE_STRING_2LEN, 2)
    })                                
  
    it("should return null if string is bigger than 65535 bytes",function(){
      expect(cjson.encodeObject(generateStringWithLength(65536))).to.be(null)
    })
  })

  describe("data encoder",function(){
    it("should encode short data (below 16 bytes) with CODE_SHORT_DATA",function(){
      testShortData(generateDataWithLength(15))
      testShortData(generateDataWithLength(4))
      testShortData(generateDataWithLength(0))
    })

    it("should encode data with upto 255 bytes with CODE_DATA_1LEN",function(){
      testEncodeData(16, codes.CODE_DATA_1LEN, 1)
      testEncodeData(255, codes.CODE_DATA_1LEN, 1)
    })

    it("should encode data with upto 65535 bytes with CODE_DATA_2LEN",function(){
      testEncodeData(256, codes.CODE_DATA_2LEN, 2)
      testEncodeData(65535, codes.CODE_DATA_2LEN, 2)
    })

    it("should return null if data is bigger than 65535 bytes",function(){
      expect(cjson.encodeObject(generateDataWithLength(65536))).to.be(null)
    })
  })

  describe("numbers encoder",function(){
    describe("positive integers",function(){
      it("should encode numbers below 256 with 1-byte",function(){
        testNumber(0, codes.CODE_PINTEGER + codes.CODE_1BYTE, 1)
        testNumber(255, codes.CODE_PINTEGER + codes.CODE_1BYTE, 1)
      })

      it("should encode numbers below 65536 with 2-bytes",function(){
        testNumber(256, codes.CODE_PINTEGER + codes.CODE_2BYTES, 2)
        testNumber(65535, codes.CODE_PINTEGER + codes.CODE_2BYTES, 2)
      })

      it("should encode numbers below 2G with 4-bytes",function(){
        testNumber(65536, codes.CODE_PINTEGER + codes.CODE_4BYTES, 4)
        testNumber(0x7fffffff, codes.CODE_PINTEGER + codes.CODE_4BYTES, 4)
      })
    })
 
    describe("negative integers",function(){
      it("should encode numbers above -256 with 1-byte",function(){
        testNumber(-255, codes.CODE_NINTEGER + codes.CODE_1BYTE, 1)
      })

      it("should encode numbers above -65536 with 2-bytes",function(){
        testNumber(-256, codes.CODE_NINTEGER + codes.CODE_2BYTES, 2)
        testNumber(-65535, codes.CODE_NINTEGER + codes.CODE_2BYTES, 2)
      })

      it("should encode numbers above -2G with 4-bytes",function(){
        testNumber(-65536, codes.CODE_NINTEGER + codes.CODE_4BYTES, 4)
        testNumber(-0x7fffffff, codes.CODE_NINTEGER + codes.CODE_4BYTES, 4)
      })
    })

    describe("floats",function(){
      it("should encode floats",function(){
        testNumber(1.1, codes.CODE_FSINGLE, 4)
        validateFloat(testNumber(common.FLOAT_MIN, codes.CODE_FSINGLE, 4), common.FLOAT_MIN)
        validateFloat(testNumber(common.FLOAT_MAX, codes.CODE_FSINGLE, 4), common.FLOAT_MAX)
      })

      it("should encode doubles",function(){
        validateDouble(testNumber(common.DOUBLE_MIN, codes.CODE_FDOUBLE, 8), common.DOUBLE_MIN)
        validateDouble(testNumber(common.DOUBLE_MAX, codes.CODE_FDOUBLE, 8), common.DOUBLE_MAX)
      })
    })
  })

  describe("null",function(){
    it("should encode null for null",function(){
      expectNullEncoding(cjson.encodeObject(null))
    })

    it("should encode null for undefined",function(){
      expectNullEncoding(cjson.encodeObject(undefined))
    })
  })

  describe("boolean encoder",function(){
    it("should encode true",function(){
      expectSingleByteCode(cjson.encodeObject(true), codes.CODE_TRUE) 
    })

    it("should encode false",function(){
      expectSingleByteCode(cjson.encodeObject(false), codes.CODE_FALSE) 
    })
  })

  describe("date encoder",function(){
    it("should encode date as seconds from POSIX time",function(){
      var result = testEncodedObject(new Date(123456), 4, codes.CODE_DATE)
      expect(result.readUInt32LE(1)).to.be(123)
    })
  })

  describe("array encoder",function(){
    it("should encode array using short-array when it has less than 16 values",function(){
      testEncodedArray(0)
      testEncodedArray(4)
      testEncodedArray(15)
    })

    it("should encode array using 1 length byte when there are less then 256 values",function(){
      testEncodedArray(16, 1)
      testEncodedArray(255, 1)
    })

    it("should encode array using 2 length bytes when there are less then 65536 values",function(){
      testEncodedArray(256, 2)
      testEncodedArray(65535, 2)
    })

    it("should return null if array is bigger than 65535 elements",function(){
      expect(cjson.encodeObject(generateArrayWithLength(65536))).to.be(null)
    })

  })

  describe("object{} encoder",function(){
    it("should encode object{} using short-array when it has less then 16 values",function(){
      testEncodedJSObject(0)
      testEncodedJSObject(4)
      testEncodedJSObject(15)
    })

    it("should encode object{} using 1 length byte when there are less then 256 values",function(){
      testEncodedJSObject(16, 1)
      testEncodedJSObject(255, 1)
    })

    it("should encode object{} using 2 length byte when there are less then 65536 values",function(){
      testEncodedJSObject(256, 2)
      testEncodedJSObject(65535, 2)
    })

    it("should return null if object{} has more than 65535 elements",function(){
      expect(cjson.encodeObject(generateJSObjectWithCount(65536))).to.be(null)
    })

  })
})

function testEncodedJSObject(len, lenBytes){
  return testEncodedObject(generateJSObjectWithCount(len), len * (2 + 7), codes.lengthCodeWithBaseLength(codes.CODE_DICT, len), lenBytes || 0)
}

function testEncodedArray(len, lenBytes){
  return testEncodedObject(generateArrayWithLength(len), len * 2, codes.lengthCodeWithBaseLength(codes.CODE_ARRAY, len), lenBytes || 0)
}

function expectNullEncoding(result){
  expectSingleByteCode(result, codes.CODE_NULL)
}

function expectSingleByteCode(result, code){
  expect(result).to.have.length(1)
  expectCode(result, code)
}

function testNumber(num, checkCode, len){
  return expectCodeWithLength(cjson.encodeObject(num), checkCode, len + 1)
}

function validateDouble(buffer , fnum){
  expect(Math.abs((buffer.readDoubleLE(1) - fnum)/fnum)).to.be.within(0, 0.0001)
}

function validateFloat(buffer, fnum){
  expect(Math.abs((buffer.readFloatLE(1) - fnum)/fnum)).to.be.within(0, 0.0001)
}

function testEncodeString(length, code, lenSize){
  return testEncodedObject(generateStringWithLength(length), length, code, lenSize)
}

function testEncodeData(length, code, lenSize){
  return testEncodedObject(generateDataWithLength(length), length, code, lenSize)
}

function testEncodedObject(object, length, code, lenSize){
  return expectCodeWithLength(cjson.encodeObject(object), code, length + 1 + (lenSize||0))
}

function expectCode(buf, code){
  expect(buf).to.be.a(Buffer)
  expect(buf.readUInt8(0)).to.be(code)
  return buf
}

function expectCodeWithLength(buf, code, len){
  expect(buf).to.have.length(len)
  return expectCode(buf, code)
}

function generateJSObjectWithCount(len){
  var obj = {}
  for ( var i = 0; i < len; ++i ) {
    obj[100000 + i] = 123
  }      
  return obj
}

function generateArrayWithLength(len){
  return generateStringWithLength(len).split('')
}
function generateStringWithLength(len){
  var s = "x"
  while ( s.length < len ) {
    s = s + s
  }
  return s.substring(0, len)
}

function generateDataWithLength(len){
  var buffer = new Buffer(len)
  buffer.write(generateStringWithLength(len), 0, len)
  return buffer
}

function testShortString(str){
  return testShortObject(str, codes.CODE_STRING)
}

function testShortData(data){
  return testShortObject(data, codes.CODE_DATA)
}
  
function testShortObject(obj, baseCode){
  var result = cjson.encodeObject(obj)
  expect(result).to.have.length(obj.length + 1)
  expectCode(result, codes.lengthCodeWithBaseLength(baseCode, obj.length))
}

