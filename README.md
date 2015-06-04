# cjson

![](https://travis-ci.org/eliran/cjson.svg?branch=master)

Compact binary json for node.js


CJSON convert javascript objects to binary encoded format to decrease transmittion size.

During the convertion CJSON would detect repeating strings and would send a reference number
 instead of the actual string. Thus, compacting the json.

In addition, an initial dictionary of strings can be provided that would allow many verbose protocol
 strings not to be sent at all.
 
 
