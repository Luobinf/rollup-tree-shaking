

function isObj(val) {
  return typeof val === "object" && val !== null;
}

function isArray(val) {
  return Array.isArray(val);
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


module.exports = {
  isObj,
  isArray,
  hasOwnProperty,
};
