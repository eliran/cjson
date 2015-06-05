var util = require('util')

module.exports = {
  FLOAT_MAX:  +3.4e+38
, FLOAT_MIN:  -3.4e+38
, DOUBLE_MAX: +1.7e+308
, DOUBLE_MIN: -1.7e+308

, isString: function(str){
    return typeof str === 'string' || str instanceof String
  }
, isInteger: function(num){
    return num === +num && num === (num|0)
  }
, isFloat: function(num){
    return num === +num && num !== (num|0)
  }
, isBoolean: function(bool){
    return typeof bool === 'boolean'
  }
, isDate: function(date){
    return util.isDate(date)
  }
, isObject: function(obj){
    return obj !== null && typeof obj === 'object'
  }
}
