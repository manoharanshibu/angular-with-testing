var main = function (configApp, config, global) {
  var faultActor = 'PIPOT',
    invoke = function (userId, params, operationType) {
      if (operationType === 'authenticate') {
        return authenticate(userId, params.password);
      } else {
        return changePassword(userId, params.password, params.newPassword);
      }
    },
    prepareAuthRequest = function (username, password) {
      var request = '<?xml version="1.0" encoding="utf-8"?>';
      request += '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
      request += '<s:Header><a:Action s:mustUnderstand="1">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>';
      request += '<a:To s:mustUnderstand="1">https://fedsvcs.linkgtm.gpn.gov.uk/adfs/services/trust/13/usernamemixed</a:To>';
      request += '<o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">';
      request += '<o:UsernameToken u:Id="uuid-6a13a244-dac6-42c1-84c5-cbb345b0c4c4-1"><o:Username>' + username + '</o:Username>';
      request += '<o:Password>' + password + '</o:Password></o:UsernameToken></o:Security>';
      request += '</s:Header>';
      request += '<s:Body><trust:RequestSecurityToken xmlns:trust="http://docs.oasis-open.org/ws-sx/ws-trust/200512">';
      request += '<wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">';
      request += '<a:EndpointReference><a:Address>https://mapsserviceproxy.gpn.gov.uk</a:Address></a:EndpointReference></wsp:AppliesTo>';
      request += '<trust:KeyType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Bearer</trust:KeyType>';
      request += '<trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>';
      request += '<trust:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</trust:TokenType>';
      request += '</trust:RequestSecurityToken></s:Body></s:Envelope>';

      return request;
    },
    prepareChangePasswordRequest = function (username, password, newPassword) {
      var request = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">';
      request += '<soap:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
      request += '<wsse:UsernameToken><wsse:Username>' + username + '</wsse:Username>';
      request += '<wsse:Password>' + password + '</wsse:Password></wsse:UsernameToken>';
      request += '</wsse:Security></soap:Header><soap:Body><tem:ChangePassword><newPassword>' + newPassword + '</newPassword>';
      request += '</tem:ChangePassword></soap:Body></soap:Envelope>';

      return request;
    },
    sendRequest = function (userId, url, data, operationType) {
      console.log("URL" + url);
      return new Promise(function (resolve, reject) {
        var ajax = new global.XMLHttpRequest();
        ajax.open('POST', url, true);

        ajax.onreadystatechange = function () {
          if (ajax.readyState === 4) {
            if (ajax.status === 200) {
              /*jshint -W024 */
              handleSecurityResponse(ajax.responseText, userId, operationType).then(resolve).catch(reject);
            } else {
              /*jshint -W024 */
              handleSecurityError(ajax.responseText, userId, operationType, ajax.status).then(resolve).catch(reject);
            }
          }
        };

        ajax.send(data.xmlRequest);
      });
    },
    logError = function (userId, operationType, faultString, faultDetails, pipotErrorCode) {

    },
    // added from commonFunctionService - for maps
    extractAttributeValueFromXML = function (xmlDoc, attributeNameValue) {
      var nodes = xmlDoc.getElementsByTagName("Attribute");

      for (var i = 0; i < nodes.length; i++) {
        var attribute = xmlDoc.getElementsByTagName("Attribute")[i].attributes[0].nodeValue;

        if (attribute === attributeNameValue) {
          return xmlDoc.getElementsByTagName("Attribute")[i].childNodes[0].childNodes[0].nodeValue;
        }
      }
      return null;
    },

    getInnerAttributeValue = function (xmlDoc, attributeValue, xPath) {
      if (typeof xmlDoc.querySelector === 'function') {
        return xmlDoc.querySelector("Attribute[Name='" + attributeValue + "']").querySelector('AttributeValue').innerHTML;
      }
      return extractAttributeValueFromXML(xmlDoc, attributeValue);
    },
    // get Lot IDs
    getLotIds = function (xmlDoc, attributeValue, xPath) {
      var lotIDs = [];
      if (typeof xmlDoc.querySelector === 'function') {
        var lotIDNode = xmlDoc.querySelector("Attribute[Name='" + attributeValue + "']").querySelectorAll('AttributeValue');
        for (var i = 0; i < lotIDNode.length; i++)
          lotIDs.push(lotIDNode[i].innerHTML.replace(/Lot /gi, ''));
        return lotIDs;
      }
      return lotIDs;
    }
  // added for maps
  extractValueFromXML = function (xmlDoc, parentTag) {
    var element = xmlDoc.getElementsByTagName(parentTag)[0].childNodes[0];

    return element.getXML() ? element.getXML().replace(/\s\s+/g, ' ') : '';
  },
  getOperationValue = function (xmlDoc, operationQueryName) {
    if (typeof xmlDoc.querySelector === 'function') {
      return xmlDoc.querySelector(operationQueryName).innerHTML;
    }
    return extractValueFromXML(xmlDoc, "ns2:" + operationQueryName);
  },
  handleSecurityResponse = function (response, userId, operationType) {
    try {
      var result = {},
        operationQuery = operationType === 'authenticate' ? 'RequestedSecurityToken' : 'ChangePasswordResult',
        xmlDoc = getXMLDoc(response);
      if (operationType === 'authenticate') {
        //var parsedDate = moment(getInnerAttributeValue(xmlDoc, 'http://dwp.gov.uk/pwdexpdate', '//Attribute/AttributeValue'), "DD/MM/YYYY");
        result.passwordExpiryDate = new Date(); //parsedDate.unix(); // to do maps
        result.userFirstName = getInnerAttributeValue(xmlDoc, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname');
        result.userLastName = getInnerAttributeValue(xmlDoc, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname');
        result.lotIds = getLotIds(xmlDoc, 'http://dwp.gov.uk/maps_lot');
      }

      /* If the operation type is authenticate, operationValue will be the token.
        If the operation type is 'changepassword', operationValue will be either a true/false result. */
      result.operationValue = getOperationValue(xmlDoc, operationQuery);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  prepareError = function (status, faultString, faultDetail, pipotErrorCode) {
    return { Status: status, FaultString: faultString, ErrorDetail: faultDetail, ErrCode: status };
  },
  handleSecurityError = function (errorResponse, userId, operationType, httpStatus) {
    if (errorResponse) {
      try {
        var querySelect = 'Subcode',
          xmlPayload = errorResponse.replace(/(\r\n|\n|\r)/gm, "").replace(/\t/g, ''),
          xmlDoc = getXMLDoc(xmlPayload),
          faultCode = xmlDoc.querySelector(querySelect).querySelector('Value').innerHTML,
          faultReason = xmlDoc.querySelector('Reason').querySelector('Text').innerHTML,
          errorObj = {};

        switch (faultCode) {
          case 'wst:FailedAuthentication':
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.INVALID_CREDENTIALS, 'Authentication failed - Invalid User credentials', 'Check user ID and password', 'PERR11');
            break;
          case 'wst:ExpiredData':
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.PASSWORD_EXPIRED, 'Authentication. Password expired', 'Password has expired. Please call your help desk to reset your password', 'PERR12');
            break;
          case 'wst:ExceededAttempts':
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.EXCEEDED_MAX_NO_OF_ATTEMPTS, 'Authentication. Exceeded log in attempts', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:InvalidRequest':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.INVALID_REQUEST, 'Authentication failed - Invalid Request', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:RequestFailed':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.REQUEST_FAILED, 'Authentication failed - Request Failed', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:InvalidSecurityToken':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.INVALID_SECURITY_TOKEN, 'Authentication failed - Invalid Security Token', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:AuthenticationBadElements':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.AUTH_BAD_ELEMENTS, 'Authentication failed - Authentication Bad Elements', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:BadRequest':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.BAD_REQUEST, 'Authentication failed - Bad Request', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:InvalidTimeRange':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.INVALID_TIME_RANGE, 'Authentication failed - Invalid Time Range', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:InvalidScope':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.INVALID_SCOPE, 'Authentication failed - Invalid scope', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:RenewNeeded':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.RENEW_NEEDED, 'Authentication failed - Renew Needed', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          case 'wst:UnableToRenew':
            // TBC - Pipot error code needs to change in configApp and error log 
            errorObj = prepareError(configApp.SECURITY_STATUS_CODES.Login.UNABLE_TO_RENEW, 'Authentication failed - Unable to renew', 'Log-on has failed. Please contact your help desk', 'PERR20');
            break;
          default:
            if (httpStatus === 404 || httpStatus === 500) {
              errorObj.Status = operationType === 'authenticate' ? configApp.SECURITY_STATUS_CODES.Login.NO_RESPONSE : configApp.SECURITY_STATUS_CODES.ChangePassword.NO_RESPONSE;
              errorObj.ErrCode = operationType === 'authenticate' ? 'PERR10' : 'PERR22';
              errorObj.ErrorDetail = 'For PIPOT ' + operationType + ' request for user ' + userId;
              errorObj.FaultString = operationType + ' response not received';
            } else {
              errorObj.Status = operationType === 'authenticate' ? configApp.SECURITY_STATUS_CODES.Login.UNKNOWN_FAILURE : configApp.SECURITY_STATUS_CODES.ChangePassword.UNKNOWN_FAILURE;
              errorObj.ErrCode = operationType === 'authenticate' ? 'PERR13' : 'PERR22';
              errorObj.ErrorDetail = 'Failure due to unknown error response ' + faultReason + ' for user ' + userId;
              errorObj.FaultString = (operationType === 'authenticate' ? 'Authentication failed' : 'Change Password failed') + ' - unknown error';
            }
            break;
        }

        return Promise.reject(errorObj);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    var status = operationType === 'authenticate' ? configApp.SECURITY_STATUS_CODES.Login.UNKNOWN_FAILURE : configApp.SECURITY_STATUS_CODES.ChangePassword.UNKNOWN_FAILURE,
      errCode = operationType === 'authenticate' ? 'PERR13' : 'PERR22',
      errorDetail = 'Failure due to unknown error response ' + faultReason + ' for user ' + userId,
      faultString = (operationType === 'authenticate' ? 'Authentication failed' : 'Change Password failed') + ' - unknown error';

    return Promise.reject({ Status: status, ErrorDetail: errorDetail, ErrCode: errCode, FaultString: faultString });
  },
  authenticate = function (userId, password) {
    var operationType = 'authenticate';
    return new Promise(function (resolve, reject) {
      return exposed.sendRequest(userId, config.AUTH, {
        'xmlRequest': prepareAuthRequest(userId, password)
      }, operationType)
        .then(function (authResponse) {

          console.log(configApp.SECURITY_STATUS_CODES.Login.OK + ":" + authResponse.operationValue + ":" + authResponse.userFirstName + ":" + authResponse.userLastName + ":" + authResponse.passwordExpiryDate)
          if (authResponse) {
            resolve({
              Status: configApp.SECURITY_STATUS_CODES.Login.OK,
              Token: authResponse.operationValue,
              FirstName: authResponse.userFirstName,
              LastName: authResponse.userLastName,
              PasswordExpiryDate: authResponse.passwordExpiryDate,
              LotIDs: authResponse.lotIds
            });
          }
        })
      /*jshint -W024 */
        .catch(function (e) {
          exposed.logError(userId, operationType, e.ErrorDetail, e.FaultString, e.ErrCode);
          reject(e);
        });
    });
  },
  changePassword = function (username, password, newPassword) {
    var operationType = 'changepassword';
    return new Promise(function (resolve, reject) {
      var promise;
      if (configApp.NOAUTH === true) {
        promise = Promise.resolve({ operationValue: 'true' });
      } else {
        promise = exposed.sendRequest(username, configApp.URLS.CHANGE_PASSWORD, { 'xmlRequest': prepareChangePasswordRequest(username, password, newPassword) }, operationType);
      }
      return promise
        .then(function (changePasswordResponse) {
          if (changePasswordResponse.operationValue) {
            resolve({ Status: configApp.SECURITY_STATUS_CODES.ChangePassword.OK, ErrorDetail: '' });
          } else {
            exposed.logError(username, operationType, 'Change Password response not received', 'For PIPOT change password request for user ' + username, 'PERR22');
            resolve({ Status: configApp.SECURITY_STATUS_CODES.ChangePassword.FAILED, ErrorDetail: 'Change password had failed.' });
          }
        })
      /*jshint -W024 */
        .catch(function (e) {
          exposed.logError(username, operationType, 'Change Password response not received', 'For PIPOT change password request for user ' + username, 'PERR22');
          reject({ Status: configApp.SECURITY_STATUS_CODES.ChangePassword.NO_RESPONSE, ErrorDetail: 'Unable to change password. Please try again or contact your help desk.' });
        });
    });
  },
  getXMLDoc = function (xmlText) {
    var isDomParser = typeof global.DOMParser !== 'undefined',
      supportActiveX = typeof global.ActiveXObject !== 'undefined',
      parser,
      xmlDoc;

    if (xmlText || xmlText === '') {
      if (isDomParser) {
        parser = new global.DOMParser();
        xmlDoc = parser.parseFromString(xmlText, "text/xml");
      } else if (supportActiveX) {
        xmlDoc = new global.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlText);
      } else {
        var xmlSaxImplementation = new global.DOMImplementation();
        xmlSaxImplementation.errorChecking = false;
        xmlDoc = xmlSaxImplementation.loadXML(xmlText);
      }
    }
    return xmlDoc;
  },
  exposed = {
    invoke: invoke,
    sendRequest: sendRequest,
    logError: logError
  };

  return exposed;
};
if (typeof module !== 'undefined') {
  module.exports = main;
}
if (typeof define === 'function') {
  define(main);
}
