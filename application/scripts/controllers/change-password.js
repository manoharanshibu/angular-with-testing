var signalling = require('signalling');
var main = function ($scope, $rootScope, $modalInstance, data, encryptionService, passwordValidationService, securityService, config, configApp) {
  var setUp = function () {
    $scope.credentials = data.credentials;
    $scope.confirmNewPassword = '';
    $scope.headerText = data.headerText;
    $scope.closeButtonText = data.closeButtonText;
    $scope.actionButtonText = data.actionButtonText;
    $scope.dueToExpire = data.dueToExpire;
    $scope.bodyText = '';
    $scope.submitted = false;
    $scope.formErrors = data.dueToExpire ? [{ 'msg': 'Your password is due to expire today' }] : [];
  },
    fetchCurrentPassword = function () { // mapsui change
      return { password: 'abcd' };/*securityPersistenceService.getUserByName($rootScope.loggedInUserId)
        .then(function (userObj) {
          return userObj;
        });*/
    };

  setUp();

  var validatePasswordChange = function () {
    $scope.formErrors = [];

    return fetchCurrentPassword()
      .then(function (fetchedUser) {
        return passwordValidationService.validatePasswords(fetchedUser.password, $scope.credentials.oldPassword, $scope.credentials.newPassword, $scope.confirmNewPassword);
      })
      .then(function (result) {
        if (result.length === 0) {
          return securityService.changePassword($rootScope.loggedInUserId, $scope.credentials.oldPassword, $scope.credentials.newPassword)
            .then(function (result) {
              if (result.Status !== configApp.SECURITY_STATUS_CODES.ChangePassword.OK) {
                $scope.formErrors.push({ 'msg': result.ErrorDetail });
              } else {
                $rootScope.password = $scope.credentials.newPassword;
                $modalInstance.close(result);
              }
            });
        } else {
          $scope.formErrors = result;
        }
      });
  };

  $scope.ok = function () {
    validatePasswordChange();
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };
};
if (typeof module !== 'undefined') {
  module.exports = main;
}
if (typeof define === 'function') {
  define(main);
}