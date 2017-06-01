require('angular');
var signalling = require('signalling');
var angular = typeof global === 'undefined' ? window.angular : global.angular;
angular.module('mapsUIApp',['ngAnimate', 'ui.bootstrap', 'ngRoute', 'route-segment', 'view-segment'])

    .run(function ($interval, $rootScope, $http, $location, $routeParams, $anchorScroll) {
        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            $location.hash($routeParams.scrollTo);
            $anchorScroll();
        });
        // to do
        $rootScope.loggedInUserObj = 
                  {
                    user: '',
                    loginAttempts: 0,
                    firstName: '', 
                    lastName: '', 
                    userId: ''
                  }
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            /*return securityPersistenceService.getLoggedInUser('loggedInUser')
            .then(function (loggedInUserObj) {*/
            loggedInUserObj = $rootScope.loggedInUserObj;
                if (loggedInUserObj && loggedInUserObj.userId !== '') {
                    $rootScope.loggedInUserId = loggedInUserObj.userId;
                    $rootScope.loginComplete = true;
                    console.log("user id " + $rootScope.loggedInUserId );
                    signalling.resolve('userLoaded');
                } else {
                    $location.path('/login');
                }
          //  });
        });
        // to do - needs internal service
        try{
            $http.get("http://ipinfo.io", function(response) {
                $rootScope.ipAddress = response.ip
            }, "jsonp");
        }catch(error){
                $rootScope.ipAddress = require('./services/ip').address();
        }
    })

    .controller("loginCtrl", ['$rootScope', require('./controllers/loginCtrl')])
    .controller("deAllocationCtrl", ['$scope', 'deAllocationService', '$uibModal', 'constants', '$rootScope', require('./controllers/deAllocationCtrl')])
    .controller("allocationCtrl", ['$scope', 'allocationService', '$uibModal', '$rootScope', 'constants', require('./controllers/allocationCtrl')])
    .controller("navigationCtrl", ['$scope', '$location', '$anchorScroll', '$rootScope', require('./controllers/navigationCtrl')])
    .controller('modalInstanceCtrl', ['$scope','$modalInstance', 'message', require('./controllers/modalInstanceCtrl')])
    .controller('security', ['$timeout', '$scope', '$rootScope', '$sce', '$location', 'securityService', 'config', 'configApp', 'modalService', require('./controllers/security')])
    .controller('change-password', ['$scope', '$rootScope', '$modalInstance', 'data', 'encryptionService', 'passwordValidationService', 'securityService', 'config', 'configApp', require('./controllers/change-password')])
    
    .service('_', [require('./services/lodash')])
    .factory('jsonHelper', [require('./utils/jsonHelper')])
    .factory('jsonToXml',[require('./utils/jsonToXml')])
    .factory('xmlBuilder',[require('./utils/xmlBuilder')])
    .factory('deAllocationService', ['$http', '$q', 'jsonToXml', 'xmlBuilder', 'jsonHelper', 'config', '$filter', '$rootScope', require('./services/deAllocationService')])
    .factory('allocationService', ['$http', '$q', 'jsonToXml', 'xmlBuilder', 'jsonHelper', 'config', '$filter', '$rootScope', require('./services/allocationService')])
    .service('encryptionService', ['$window', require('./services/encryption-service')])
    .service('modalService', ['$uibModal', '$sce', require('./services/modal-service')])
    .service('configApp', [require('./services/config-app')])
    .service('passwordValidationService', ['encryptionService', '_', require('./services/password-validation-service')])
    .factory('securityMapsService', ['configApp', 'config', '$window', require('./services/maps/security')])
    .factory('securityService', ['$rootScope', 'config', 'configApp', 'securityMapsService', 'encryptionService', require('./services/security')])
    .constant('constants', require('./services/constants'))
    .constant('config', require('./services/config'))
    
    
/**
*******************************************************
configure the angular route module
*******************************************************
*/
    .config(['$routeSegmentProvider', '$routeProvider', function ($routeSegmentProvider, $routeProvider) {
  $routeSegmentProvider.options.autoLoadTemplates = true;

  $routeSegmentProvider.

    when('/home', 'login').
    when('/index', 'login').
    when('/login', 'login').

    segment('index', {
      "default": true,
      templateUrl: 'views/home.html',
      title: 'MAPS UI' }).

    segment('login', {
      "default": true,
      templateUrl: 'views/login.html',
      controller: 'security',
      title: 'Login' });

    $routeProvider.otherwise({
      redirectTo: '/login'
    });
}]);
