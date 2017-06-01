var sortApp = angular.module('sortApp', [])

.controller('mainController', function($scope) {})
  
  
 .directive('ngLength', NgLength);

    function NgLength() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function($scope, $element, $attrs, ngModel) {
                $scope.$watch($attrs.ngModel, function(value) {
                    var isValid = (value.length === 2);
                    ngModel.$setValidity($attrs.ngModel, isValid);
                });
            }
        }
    }
