var main = function () {
  var config = {
    AUTH: 'requestsecuritytoken',
    CHANGE_PASSWORD: 'changepassword',
    NOAUTH: true,
    SECURITY_STATUS_CODES: {
      Login: {
        OK: '0',
        NO_RESPONSE: 'PERR10',
        PASSWORD_DUE_TO_EXPIRE: 'PERR21',
        INVALID_CREDENTIALS: 'PERR11',
        EXCEEDED_MAX_NO_OF_ATTEMPTS: 'PERR20',
        PASSWORD_EXPIRED: 'PERR12',
        UNKNOWN_FAILURE: 'PERR13',
        OFFLINE_NO_CREDENTIALS: 'OFFLINE_NO_CREDENTIALS',
        INVALID_REQUEST: 'PERR90', /* Will change when proper codes are received */
        REQUEST_FAILED: 'PERR91', /* Will change when proper codes are received */
        INVALID_SECURITY_TOKEN: 'PERR92', /* Will change when proper codes are received */
        AUTH_BAD_ELEMENTS: 'PERR93', /* Will change when proper codes are received */
        BAD_REQUEST: 'PERR94', /* Will change when proper codes are received */
        INVALID_TIME_RANGE: 'PERR95', /* Will change when proper codes are received */
        INVALID_SCOPE: 'PERR96', /* Will change when proper codes are received */
        RENEW_NEEDED: 'PERR97', /* Will change when proper codes are received */
        UNABLE_TO_RENEW: 'PERR98' /* Will change when proper codes are received */,
        REDIRECT_TO_LOGIN: 'REDIRECT_TO_LOGIN'
      },
      ChangePassword: {
        OK: '0',
        NO_RESPONSE: 'PERR22',
        FAILED: 'PERR22',
        UNKNOWN_FAILURE: 'PERR22',
        REDIRECT_TO_LOGIN: 'REDIRECT_TO_LOGIN'
      }
    }
  }
  return config;
}
if (typeof module !== 'undefined') {
  module.exports = main;
}
if (typeof define === 'function') {
  define(main);
}