var expect = require('chai').expect
  , cjson  = require('../index')
  , Compactor = require('../compactor')

describe('compact object',function(){
  it('should create a compactor object with empty dictionary',function(){
     var compactor = cjson.createCompactor()
     expect(compactor).to.be.instanceof(Compactor)
     expect(compactor.countOfEntries).to.equal(0)
  })

  it('should create a compactor object with initial dictionary',function(){
     expect(cjson.createCompactor(['1','2','3']).countOfEntries).to.equal(3)
  })

  it('should discard non-string values from initial dictionary',function(){
     expect(cjson.createCompactor(['1',1,'2',3,'3',[],{},1.5]).countOfEntries).to.equal(3)
  })

  it('should return the index of a matching entry',function(){
     var compactor = defaultCompactor()
     expect(compactor.valueOf('123')).to.equal(0)
     expect(compactor.valueOf('testing')).to.equal(2)
     expect(compactor.valueOf('values')).to.equal(3)
  })

  it('should return null when key does not match',function(){
     expect(defaultCompactor().valueOf('unknownKey')).to.equal(null)
  })

  it('should add missing strings to the compactor using compact method and return null',function(){
     var compactor = defaultCompactor()
     expect(compactor.compact('missingKey')).to.equal(null)
     expect(compactor.countOfEntries).to.equal(5)
     expect(compactor.valueOf('missingKey')).to.equal(4)
  })

  it('should return the index of a repeated key using compact',function(){
     var compactor = defaultCompactor()
     expect(compactor.compact('missingKey')).to.equal(null)
     expect(compactor.compact('missingKey')).to.equal(4)
  })

  it('should revert to initial dictionary when reset',function(){
     var compactor = defaultCompactor()
     compactor.compact('missingKey')
     compactor.reset()
     expect(compactor.countOfEntries).to.equal(4)
     expect(compactor.valueOf('missingKey')).to.equal(null)
  })

  it('should copy a compactor with only the initial dictionary',function(){
     var compactor = defaultCompactor()
     compactor.compact('missingKey')
     var compactorCopy = compactor.copy()
     expect(compactorCopy.countOfEntries).to.equal(4)
     expect(compactor.countOfEntries).to.equal(5)
  })
})

function defaultCompactor(){
  return cjson.createCompactor([
    '123'
  , 'abc'
  , 'testing'
  , 'values'
  ])
}

