var common = require('./common')
  , Compactor = module.exports = function(initialEntries){
  if ( !(this instanceof Compactor) ) return new Compactor(initialEntries)
  var self = this

  this.baseEntries = {}
  this.baseEntriesArray = []
  this.baseEntriesCount = populateEntries(this.baseEntries, this.baseEntriesArray, initialEntries)
  this.extendedEntries = {}
  this.extendedEntriesArray = []
  this.totalEntriesCount = this.baseEntriesCount
   
  Object.defineProperty(this, 'countOfEntries', { get: function(){ return self.totalEntriesCount } })
}

Compactor.prototype.indexOf = function(key){
  if ( key in this.extendedEntries )
    return this.extendedEntries[key]
  if ( key in this.baseEntries ){
    var value = this.extendedEntries[key] = this.baseEntries[key]
    return value
  }
  return null
}

Compactor.prototype.valueOf = function(inx){
  if ( inx >= 0 && inx < this.totalEntriesCount ) {
    if ( inx < this.baseEntriesCount )
      return this.baseEntriesArray[inx]
    inx -= this.baseEntriesCount
    return this.extendedEntriesArray[inx]
  }
  return null
}

Compactor.prototype.compact = function(value){
  var keyIndex = this.indexOf(value)
  if ( keyIndex === null && value.length > 1 ){
    this.extendedEntriesArray.push(value)
    this.extendedEntries[value] = this.totalEntriesCount
    this.totalEntriesCount += 1
  }
  return keyIndex
}

Compactor.prototype.reset = function(){
  this.totalEntriesCount = this.baseEntriesCount
  this.extendedEntries = {}
}

Compactor.prototype.copy = function(){
  var copy = new Compactor()
  copy.baseEntries = this.baseEntries
  copy.baseEntriesArray = this.baseEntriesArray
  copy.baseEntriesCount = this.baseEntriesCount
  copy.totalEntriesCount = this.baseEntriesCount
  return copy
}

Compactor.isCompactor = function(possibleCompactor){
  return possibleCompactor instanceof Compactor
}

Compactor.create = function(initialEntries){
  return new Compactor(initialEntries)
}

function populateEntries(objectToPopulate, arrayToPopulate, entries){
  var baseIndex = arrayToPopulate.length
  if ( Array.isArray(entries) ) {
    for (var i = 0; i < entries.length; ++i){
      var entry = entries[i]
      if ( common.isString(entry) && !(entry in objectToPopulate) ) {
        arrayToPopulate.push(entry)
        objectToPopulate[entry] = baseIndex++
      }
    }
  }
  return baseIndex
}

