var expect = require('chai').expect
  , testCommon = require('./testCommon')
  , common = require('../common')

describe('objects decoder',function(){
  it('should decode any encoded string',function(){
    testCommon.runTestCases([
      [ 'Zero length string', testCommon.generateStringWithLength(0) ]
    , [ '4 char string', testCommon.generateStringWithLength(4) ]
    , [ '15 char string', testCommon.generateStringWithLength(15) ]
    , [ '16 char string', testCommon.generateStringWithLength(16) ]
    , [ '255 char string', testCommon.generateStringWithLength(255) ]
    , [ '256 char string', testCommon.generateStringWithLength(256) ]
    , [ '65535 char string', testCommon.generateStringWithLength(65535) ]
    ])
  })

  it('should decode any encoded data',function(){
    testCommon.runTestCases([
      [ 'Zero length data', testCommon.generateDataWithLength(0) ]
    , [ '4 byte data', testCommon.generateDataWithLength(4) ]
    , [ '15 byte data', testCommon.generateDataWithLength(15) ]
    , [ '16 byte data', testCommon.generateDataWithLength(16) ]
    , [ '255 byte data', testCommon.generateDataWithLength(255) ]
    , [ '256 byte data', testCommon.generateDataWithLength(256) ]
    , [ '65535 byte data', testCommon.generateDataWithLength(65535) ]
    ])
  })

  it('should decode null & boolean values',function(){
    testCommon.runTestCases([
      [ 'Null value', null ]
    , [ 'True value', true ]
    , [ 'False value', false ]
    ])
  })  

  it('should decode date values',function(){
    testCommon.runTestCases([
      new Date(12345 * 1000)
    , new Date(56789 * 1000)
    ])
  })

  it('should decode positive integers',function(){
    testCommon.runTestCases([0, 16, 256, 65535, 88888, 0x7fffffff])
  })

  it('should decode negative integers',function(){
    testCommon.runTestCases([-1, -16, -256, -65535, -88888, -0x7fffffff])
  })

  it('should decode floats',function(){
    testCommon.runFloatTestCases([1.123,52.123,common.FLOAT_MIN,common.FLOAT_MAX])
  })

  it('should decode doubles',function(){
    testCommon.runFloatTestCases([common.DOUBLE_MIN,common.DOUBLE_MAX])
  })

  it('should decode arrays',function(){
    testCommon.runTestCases([
      [ 'Zero length array', testCommon.generateArrayWithLength(0) ]
    , [ '4 Elements array', testCommon.generateArrayWithLength(4) ]
    , [ '15 Elements array', testCommon.generateArrayWithLength(15) ]
    , [ '16 Elements array', testCommon.generateArrayWithLength(16) ]
    , [ '255 Elements array', testCommon.generateArrayWithLength(255) ]
    , [ '256 Elements array', testCommon.generateArrayWithLength(256) ]
    , [ '65535 Elements array', testCommon.generateArrayWithLength(65535) ]
    , [ 'nasted array', [ 1, 2, 3, 'x', 'y', [ 4, 5, 6, 'm', 'n' ] ] ]
    ])
  })

  it('should decode object{}',function(){
    testCommon.runTestCases([
      [ 'Zero length object{}', testCommon.generateJSObjectWithCount(0) ]
    , [ '4 Elements object{}', testCommon.generateJSObjectWithCount(4) ]
    , [ '15 Elements object{}', testCommon.generateJSObjectWithCount(15) ]
    , [ '16 Elements object{}', testCommon.generateJSObjectWithCount(16) ]
    , [ '255 Elements object{}', testCommon.generateJSObjectWithCount(255) ]
    , [ '256 Elements object{}', testCommon.generateJSObjectWithCount(256) ]
    , [ '65535 Elements object{}', testCommon.generateJSObjectWithCount(65535) ]
    , [ 'nasted object{}', { a: 1, b: 2, c: 3, d: 'x', e: 'y', f: { g: 4, h: 5, i: 6, j: 'm', k: 'n' } } ]
    ])
  })

})

                                                