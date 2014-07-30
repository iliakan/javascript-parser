/**
 * unique ordered Set of strings, based on objects
 * I implemented it because ES6 set is not fully in node 0.11.13 (no .values() call)
 * @constructor
 */
function StringMap() {
  this.store = {};
}

/**
 * Allow strings which collide with object props like __proto__
 * by prepending them with "*"
 * @param str
 */
StringMap.prototype.set = function(str, value) {
   this.store["*" + str] = value;
};

StringMap.prototype.get = function(str) {
   return this.store["*" + str];
};

StringMap.prototype.has = function(str) {
  return ("*" + str) in this.store;
};

StringMap.prototype.keys = function() {
  var result = [];
  for (var key in this.store) {
    result.push(key.slice(1));
  }
  return result;
};

module.exports = StringMap;
