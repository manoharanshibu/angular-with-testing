if (!window.__signals) {
  window.__signals = {};
}

var signals = window.__signals,
  signalling = {
    setup: function (signalName, cautiousSetup) {
      var signalDescriptor = signals[signalName];

      if (cautiousSetup && signalDescriptor) {
        return signalDescriptor;
      } 

      // If we have a recently created signal, use that
      if (signalDescriptor && signalDescriptor.birth > Date.now() - 1000) {
        return signalDescriptor;
      }

      signalDescriptor = { resolved: false, rejected: false, birth: Date.now() };
      signalDescriptor.promise = new Promise(function (resolve, reject) {
        signalDescriptor.resolve = resolve;
        signalDescriptor.reject = reject;
      });

      signals[signalName] = signalDescriptor;

      return signalDescriptor;
    },
    clear: function (signalName) {
      delete signals[signalName];
    },
    await: function (signalName, forceReset) {
      // If we await before any signal is created, then do the creation here
      var signalDescriptor = signalling.setup(signalName, !forceReset);
      if (signalDescriptor.rejected) {
        return Promise.reject(signalDescriptor.reason);
      } else if (signalDescriptor.resolved) {
        return Promise.resolve(signalDescriptor.message);
      }
      return signalDescriptor.promise;
    },
    resolve: function (signalName, message) {
      var signalDescriptor = signals[signalName];
      if (signalDescriptor) {
        signalDescriptor.message = message;
        signalDescriptor.resolved = true;
        return signalDescriptor.resolve(message);
      }
      return Promise.resolve(message);
    },
    reject: function (signalName, reason) {
      var signalDescriptor = signals[signalName],
        rejection = { name: signalName, reason: reason };
      if (signalDescriptor) {
        signalDescriptor.reason = reason;
        signalDescriptor.rejected = true;
        return signalDescriptor.reject(rejection);
      }
      return Promise.reject(rejection);
    }
  };

if (typeof module !== 'undefined') {
  module.exports = signalling;
}
if (typeof define === 'function') {
  define(signalling);
}
