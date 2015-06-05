'use strict'
var cjson  = require('../index')
  , expect = require('chai').expect
  , self = module.exports = {}

self.generateJSObjectWithCount = function(len){
  var obj = {}
  for ( var i = 0; i < len; ++i ) {
    obj[100000 + i] = 123
  }      
  return obj
}

self.generateArrayWithLength = function(len){
  return self.generateStringWithLength(len).split('')
}

self.generateStringWithLength = function(len){
  var s = len>1 ? "xy" : "x"
  while ( s.length < len ) {
    s = s + s
  }
  return s.substring(0, len)
}

self.generateDataWithLength = function(len){
  var buffer = new Buffer(len)
  buffer.write(self.generateStringWithLength(len), 0, len)
  return buffer
}

self.runTestCases = function(cases){
  for (var i = 0; i < cases.length; ++i ){
    var testCase = cases[i]
      , testDescription = 'Test #' + (i+1).toString()
    if ( Array.isArray(testCase) ){
      testDescription = testCase[0]
      testCase = testCase[1]
    }
    expect(cjson.decodeObject(cjson.encodeObject(testCase)), testDescription).to.deep.equal(testCase)
  }
}

self.runFloatTestCases = function(cases){
  for (var i = 0; i < cases.length; ++i ){
    var number = cases[i]
    var decodedNumber = cjson.decodeObject(cjson.encodeObject(number))
    expect((decodedNumber - number)/number).to.closeTo(0, 0.0001)
  }
}