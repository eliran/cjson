var common = require('./common')
  , Compactor = module.exports = function(initialEntries){
  if ( !(this instanceof Compactor) ) return new Compactor(initialEntries)
  var self = this

  this.baseEntries = {}
  this.baseEntriesCount = populateEntries(this.baseEntries, initialEntries)
  this.extendedEntries = {}
  this.totalEntriesCount = this.baseEntriesCount
   
  Object.defineProperty(this, 'countOfEntries', { get: function(){ return self.totalEntriesCount } })
}

Compactor.prototype.valueOf = function(key){
  if ( key in this.extendedEntries )
    return this.extendedEntries[key]
  if ( key in this.baseEntries ){
    var value = this.extendedEntries[key] = this.baseEntries[key]
    return value
  }
  return null
}

Compactor.prototype.compact = function(value){
  var keyIndex = this.valueOf(value)
  if ( keyIndex === null ){
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
  copy.baseEntriesCount = this.baseEntriesCount
  copy.totalEntriesCount = this.baseEntriesCount
  return copy
}

Compactor.create = function(initialEntries){
  return new Compactor(initialEntries)
}

function populateEntries(objectToPopulate, entries, baseIndex){
  baseIndex = baseIndex || 0
  if ( Array.isArray(entries) ) {
    for (var i = 0; i < entries.length; ++i){
      var entry = entries[i]
      if ( common.isString(entry) && !(entry in objectToPopulate) ) {
        objectToPopulate[entry] = baseIndex++
      }
    }
  }
  return baseIndex
}
                