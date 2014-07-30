/**
 * unique ordered Set of strings, based on objects
 * I implemented it because ES6 set is not fully in node 0.11.13 (no .values() call)
 * @constructor
 */
function StringSet() {
  this.store = {};
}

/**
 * Allow strings which collide with object props like __proto__
 * by prepending them with "*"
 * @param str
 */
StringSet.prototype.add = function(str) {
   this.store["*" + str] = true;
};

StringSet.prototype.has = function(str) {
  return ("*" + str) in this.store;
};

StringSet.prototype.toArray = function() {
  var result = [];
  for (var key in this.store) {
    result.push(key.slice(1));
  }
  return result;
};

module.exports = StringSet;
