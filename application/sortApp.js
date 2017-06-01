var sortApp = angular.module('sortApp', [])

.controller('mainController', function($scope, $http) {
  $scope.sortType     = 'name'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order
  $scope.searchFish   = '';     // set the default search/filter term
  
  // create the list of sushi rolls 
  $scope.sushi = [
    { name: 'Cali Roll', fish: 'Crab', tastiness: 2 },
    { name: 'Philly', fish: 'Tuna', tastiness: 4 },
    { name: 'Tiger', fish: 'Eel', tastiness: 7 },
    { name: 'Rainbow', fish: 'Variety', tastiness: 6 }
  ];
  
  var data = 
      '<uk:MAPSAssessmentMetadataDetailListRequest>' +
         '<uk:MAPSOpsRequestHeader>' +
            '<uk:ClientRequestId>?</uk:ClientRequestId>' +
            '<uk:UserId>?</uk:UserId>' +
            '<uk:Benefit>?</uk:Benefit>' +
            '<uk:Operation>?</uk:Operation>' +
            '<uk:IPAddress>?</uk:IPAddress>' +
            '<uk:HostName>?</uk:HostName>' +
            '<uk:RequestDateTime>?</uk:RequestDateTime>' +
         '</uk:MAPSOpsRequestHeader>' +
         '<uk:MAPSAssessmentMetadataDetailListRequestBody>' +
            '<!--You have a CHOICE of the next 3 items at this level-->' +
            '<!--Optional:-->' +
            '<uk:NINO>?</uk:NINO>' +
            '<!--Optional:-->' +
            '<uk:CRN>?</uk:CRN>' +
            '<!--Optional:-->' +
            '<uk:AllocatedUserId>?</uk:AllocatedUserId>' +
         '</uk:MAPSAssessmentMetadataDetailListRequestBody>' +
      '</uk:MAPSAssessmentMetadataDetailListRequest>';
  
  
  var soapRequest = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:maps="http://uk.gov.dwp.maps" xmlns:pipat="http://uk.gov.dwp.pipat"><soap:Header></soap:Header><soap:Body>' + data + '</soap:Body></soap:Envelope>';
  
 $http.post("http://Shibus-MacBook-Pro.local:8088/mockMAPSAssessmentMetadataDetailListBinding", soapRequest, {
      'headers': {
        'SOAPAction': 'http://uk.gov.dwp.maps/getassessmentmetadatadetaillist',
        'Content-Type': 'application/soap+xml; charset=utf-8'
      }
    }, successCallback, errorCallback)
  
  function successCallback(){
    //alert("success");
  }
  
  function errorCallback(){
    //alert("failed")
  }
  //alert(soapRequest);
 
  
  var preSubmissionShim = function (soapRequest) {
          return soapRequest
            .replace(/maps:MAPSOpsRequestHeader/g, 'MAPSOpsRequestHeader')
            .replace(/maps:MAPSDocumentRequestBody/g, 'MAPSDocumentRequestBody');
        };
        soapRequest = preSubmissionShim(soapRequest);
  $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $http.post("http://Shibus-MacBook-Pro.local:8088/mockMAPSAssessmentMetadataDetailListBinding", soapRequest, {
              'headers': {
                'SOAPAction': 'http://uk.gov.dwp.maps/getassessmentmetadatadetaillist',
                'Content-Type': 'text/xml; charset=utf-8'
              }
        }, null, successCallback, errorCallback);
});