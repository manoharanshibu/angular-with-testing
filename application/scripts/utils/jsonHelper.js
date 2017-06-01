function jsonHelper() {

    var service = {
        nameValueObject: { __prefix: "", __text: "" },
        buildJSON: buildJSON,
        xmlToJson: xmlToJson,
        getXMLDoc: getXMLDoc
    };

    return service;

    function buildJSON(_array) {
        var obj = {}
        for (var i = 0; i < _array.length; i++) {
            obj[_array[i]] = angular.copy(service.nameValueObject);
        }

        return obj;
    }

    function replacer(key, value) {
        return value;
    }


    function xmlToJson(xml) {

        var obj = {};
        if (xml.nodeType == 1) {
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    var attrName = attribute.nodeName.replace(/uk:/g, '');
                    attrName = attrName.replace(/soap:/g, '')
                    obj["@attributes"][attrName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) {
            obj = xml.nodeValue;
        }
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName.replace(/uk:/g, '');
                nodeName = nodeName.replace(/soap:/g, '');
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    }

    function getXMLDoc(xmlText) {
        var parser, xmlDoc;
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlText, "text/xml");
        return xmlDoc;
        /*if ($window.DOMParser) {
            parser = new $window.DOMParser();
            xmlDoc = parser.parseFromString(xmlText,"text/xml");
        } else {
            if ($window.ActiveXObject) {
            xmlDoc = new $window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlText);
            }
        }*/
        return xmlDoc;
    }

};

module.exports = jsonHelper;