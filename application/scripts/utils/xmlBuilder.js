function xmlBuilder() {

    return {
        addRequestHeaders: function (soapBody, token) {
            var soapRequest = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:uk="http://uk.gov.dwp.maps" xmlns:pipat="http://uk.gov.dwp.pipat"><soap:Header>';
            if (token) {
                var formattedToken = token.replace(/(\r\n|\n|\r)/gm, "").replace(/\t/g, '').replace(/\s+/g, ' ');
                soapRequest += '<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
                soapRequest += formattedToken + '</wsse:Security>';
            }
            soapRequest += '</soap:Header>' + soapBody + '</soap:Envelope>';
            return soapRequest;

        }
    }
}

module.exports = xmlBuilder;