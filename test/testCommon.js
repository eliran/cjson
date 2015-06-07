'use strict'
var cjson  = require('../index')
  , expect = require('chai').expect
  , self = module.exports = {}
  , cachedGeneratedString = "xy"
  , cachedGeneratedArray = []

self.generateJSObjectWithCount = function(len){
  var obj = {}
  for ( var i = 0; i < len; ++i ) {
    obj[100000 + i] = 123
  }      
  return obj
}

self.generateArrayWithLength = function(len){
  if ( cachedGeneratedArray.length < len ) {
    cachedGeneratedArray = self.generateStringWithLength(len).split('')
  }
  return cachedGeneratedArray.slice(0, len)
}

self.generateStringWithLength = function(len){
  while ( cachedGeneratedString.length < len ) {
    cachedGeneratedString = cachedGeneratedString + cachedGeneratedString
  }
  return cachedGeneratedString.substring(0, len)
}

self.generateDataWithLength = function(len){
  var buffer = new Buffer(len)
  buffer.write(self.generateStringWithLength(len), 0, len)
  return buffer
}

self.runTestCases = function(cases){
  for (var i = 0; i < cases.length; ++i ){
    var testCase = cases[i]
      , testDescription = ''
    if ( Array.isArray(testCase) ){
      testDescription = testCase[0]
      testCase = testCase[1]
    }
    else testDescription = testCase.toString() || ('Test #' + (i+1).toString())
    it(testDescription,function(){
      expect(cjson.decodeObject(cjson.encodeObject(testCase))).to.deep.equal(testCase)
    })
  }
}

self.runFloatTestCases = function(cases){
  for (var i = 0; i < cases.length; ++i ){
    var number = cases[i]
    var decodedNumber = cjson.decodeObject(cjson.encodeObject(number))
    expect((decodedNumber - number)/number).to.closeTo(0, 0.0001)
  }
}


// Make sure we have an array cached (Will also cache big string) to help tests run quicker
self.generateArrayWithLength(65536)
