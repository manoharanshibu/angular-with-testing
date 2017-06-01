function allocationService($http, $q, jsonToXml, xmlBuilder, jsonHelper, config, $filter, $rootScope ){

    var service = {
        claimants: [],
        getClaimant: getClaimant,
        allocate: allocate
    };

    return service;

    function getClaimant(claimantId){
        
        var now = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss'); // 2015-11-10-T13:11:03
        
        var isCrn = isNaN(claimantId) ? false : true;
        var def = $q.defer(),
            
            requestJson = {
                "soap:Body": {
                    "uk:MAPSAssessmentMetadataDetailListRequest": {
                        "uk:MAPSOpsRequestHeader": {
                            "uk:ClientRequestId": claimantId,
                            "uk:UserId": $rootScope.loggedInUserObj.userId,
                            "uk:Benefit": "PIP",
                            "uk:Operation": "GetAssessmentMetadata",
                            "uk:IPAddress": $rootScope.ipAddress,
                            "uk:HostName": window.location.hostname,
                            "uk:RequestDateTime": now
                        },
                        "uk:MAPSAssessmentMetadataDetailListRequestBody": {
                        }
                    }
                }
            };
            
            var reqBody = requestJson["soap:Body"]["uk:MAPSAssessmentMetadataDetailListRequest"]["uk:MAPSAssessmentMetadataDetailListRequestBody"];
            if(isCrn){
                reqBody["uk:CRN"] = claimantId;
            }else{
                reqBody["uk:NINO"] = claimantId;
            }
            var soapBody = jsonToXml.jstoxml(requestJson),
            soapRequest = xmlBuilder.addRequestHeaders(soapBody, $rootScope.loggedInUserObj.token),
            SEARCH_CLAIMANTS_URL = config.URL + config.SEARCH_CLAIMANTS_PATH;

        $http.post(SEARCH_CLAIMANTS_URL, soapRequest, {
            'headers': {
                'SOAPAction': 'http://uk.gov.dwp.maps/getassessmentmetadatadetaillist',
                'Content-Type': 'text/xml; charset=utf-8'
            }}).then(successCallback, errorCallback);
        function successCallback(response){
            try{
                var responseData = response.data.replace(/(\r\n|\n|\r)/gm, "").replace(/\t/g, '');
                var xmlDoc = jsonHelper.getXMLDoc(responseData)
                var result = jsonHelper.xmlToJson(xmlDoc);
                console.log(result.Envelope);
                var MAPSAssessmentMetadataDetailListResponseBody = result.Envelope.Body.MAPSAssessmentMetadataDetailListResponse.MAPSAssessmentMetadataDetailListResponseBody
                var DetailListItem = null;
                if(MAPSAssessmentMetadataDetailListResponseBody.DetailListItem){
                    DetailListItem = MAPSAssessmentMetadataDetailListResponseBody.DetailListItem;
                    console.log("JSON Response is " + JSON.stringify(DetailListItem));
                }
                if(DetailListItem == null){
                    def.resolve(null);
                }else{
                    def.resolve(angular.isArray(DetailListItem)? DetailListItem : new Array(DetailListItem));
                }
            }catch(error){
                console.log("Failed to parse  data " + error);
                def.reject("Failed to get allocations");
            }
        }
        function errorCallback(){
            def.reject("Failed to get allocations");
        }
        return def.promise;
    };

    function allocate(allocations){

        var promises = [];

        angular.forEach(allocations , function(allocation) {
            var now = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss'); // 2015-11-10-T13:11:03
            
            var def = $q.defer(),

                requestJson = {
                    "soap:Body": {
                        "uk:MAPSAllocateUserRequest": {
                            "uk:MAPSOpsRequestHeader": {
                                "uk:ClientRequestId": allocation.AssessmentId["#text"],
                                "uk:UserId": $rootScope.loggedInUserObj.userId,
                                "uk:Benefit": "PIP",
                                "uk:Operation": "Allocate",
                                "uk:IPAddress": $rootScope.ipAddress,
                                "uk:HostName": window.location.hostname,
                                "uk:RequestDateTime": now
                            },
                            "uk:MAPSAllocateUserRequestBody": {
                                "uk:UserToBeAllocated": $rootScope.staffNumber,
                                "uk:Benefit": "PIP",
                                "uk:AssessmentId": allocation.AssessmentId["#text"],
                                "uk:AssessmentProviderLotId": allocation.AssessmentProviderLotId["#text"],
                                "uk:AppointmentDateTime": now
                            }
                        }
                    }
                },

                soapBody = jsonToXml.jstoxml(requestJson),
                soapRequest = xmlBuilder.addRequestHeaders(soapBody, $rootScope.loggedInUserObj.token),
                ALLOCATE_ASSESSMENT_URL = config.URL + config.ALLOCATE_ASSESSMENT_PATH;

            $http.post(ALLOCATE_ASSESSMENT_URL, soapRequest, {
                'headers': {
                    'SOAPAction': 'http://uk.gov.dwp.maps/MAPSAllocate',
                    'Content-Type': 'text/xml; charset=utf-8'
                }}).then(successCallback, errorCallback);
            function successCallback(response){
                try{
                    var responseData = response.data.replace(/(\r\n|\n|\r)/gm, "").replace(/\t/g, '');
                    var xmlDoc = jsonHelper.getXMLDoc(responseData)
                    var result = jsonHelper.xmlToJson(xmlDoc);
                    console.log(result.Envelope);
                    var MAPSOpsResponseHeader = result.Envelope.Body.MAPSAllocateUserResponse.MAPSOpsResponseHeader
                    var ResponseStatus = null;
                    var ClientRequestId = null;
                    if(MAPSOpsResponseHeader.ResponseStatus){
                        ResponseStatus = MAPSOpsResponseHeader.ResponseStatus["#text"];
                        ClientRequestId = MAPSOpsResponseHeader.RequestHeader.RequestDateTime["#text"];
                        console.log("JSON Response Status is " + ResponseStatus);
                    }                       
                    def.resolve({ResponseStatus:ResponseStatus, ClientRequestId:ClientRequestId});
                }catch(error){
                    console.log("Failed to parse  data " + error);
                    def.reject("Failed to allocate");
                }
            }
            function errorCallback(){
                def.reject("Failed to allocate");
            }
            promises.push(def.promise);
        });
        return $q.all(promises);
    };

};

module.exports = allocationService;