var main = function (global) {
  var hex = function (buffer) {
    var hexCodes = [],
      view = new global.DataView(buffer),
      i,
      value,
      stringValue,
      padding,
      paddedValue;

    for (i = 0; i < view.byteLength; i += 4) {
      // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
      value = view.getUint32(i);
      // toString(16) will give the hex representation of the number without padding
      stringValue = value.toString(16);
      // We use concatenation and slice for padding
      padding = '00000000';
      paddedValue = (padding + stringValue).slice(-padding.length);
      hexCodes.push(paddedValue);
    }

    // Join all the hex strings into one
    return hexCodes.join("");
  },
    hashValue = function (value) {
      var crypto = global.crypto || global.msCrypto, // for IE 11
        buffer = new global.TextEncoder("utf-8").encode(value);

      return crypto.subtle.digest('SHA-256', buffer)
        .then(function (hashValue) {
          return hex(hashValue);
        });
    };

  return {
    hashValue: hashValue
  };
};
if (typeof module !== 'undefined') {
  module.exports = main;
}
if (typeof define === 'function') {
  define(main);
}
