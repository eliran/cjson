var expect = require('expect.js')
var cjson  = require('../index')
var codes  = require('../codes')

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
      validateFloat(testNumber(cjson.FLOAT_MIN, codes.CODE_FSINGLE, 4), cjson.FLOAT_MIN)
      validateFloat(testNumber(cjson.FLOAT_MAX, codes.CODE_FSINGLE, 4), cjson.FLOAT_MAX)
    })

    it("should encode doubles",function(){
      validateDouble(testNumber(cjson.DOUBLE_MIN, codes.CODE_FDOUBLE, 8), cjson.DOUBLE_MIN)
      validateDouble(testNumber(cjson.DOUBLE_MAX, codes.CODE_FDOUBLE, 8), cjson.DOUBLE_MAX)
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

function expectNullEncoding(result){
  expectCode(result, codes.CODE_NULL)
  expect(result).to.have.length(1)
}

function testNumber(num, checkCode, len){
  var result = cjson.encodeObject(num)
  expectCode(result, checkCode)
  expect(result).to.have.length(len + 1)
  return result
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
  var result = cjson.encodeObject(object)
  expectCode(result, code)
  expect(result).to.have.length(length + 1 + lenSize)
}

function expectCode(buf, code){
  expect(buf).to.be.a(Buffer)
  expect(buf.readUInt8(0)).to.be(code)
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

