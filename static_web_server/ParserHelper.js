/**
 * Created by eyal on 17/12/2015.
 */

exports.legalExtensions = {"js": "application/javascript", "txt": "text/plain", "html" : "text/html",
    "css" : "text/css", "jpg" : "image/jpeg", "gif" : "image/gif"};
function parseFirstLine(subString) {

    var type = subString.substr(0, subString.indexOf(" "));

    var urlName = subString.substring(subString.indexOf("/"), subString.indexOf("."));

    subString = subString.substr(subString.indexOf(".") + 1, subString.length);

    var urlType = subString.substr(0, subString.indexOf(" "));

    subString = subString.substr(subString.indexOf(" ") + 1, subString.length);

    var version = subString.substr(subString.indexOf("HTTP") + 5, subString.length);

    return [type, urlName, urlType, version];
}

    function parseValues(valuesString)
    {
        var values = [];
        while (valuesString.indexOf(",") != -1)
        {
            values.push(valuesString.substr(0,valuesString.indexOf(",")  ));
            valuesString = valuesString.substring(valuesString.indexOf(",") + 2, valuesString.length);
        }
        values.push(valuesString);
        return values;
    }

function HTTPRequest()
{
    this.headersAndVals =
    {
        'Content_Length': [0]
    };
    this.body = "";
    this.initialLine = [];

    return this;
}

HTTPRequest.prototype.getHeader = function (headerName) {
    return this.headersAndVals[headerName];
};

HTTPRequest.prototype.setHeader = function (key, value) {
    this.headersAndVals[key] = value;
};

exports.parse = function Parser(callback)
{
    this.request = new HTTPRequest();
    this.callback = callback;
    this.started = false;
    this.inHeaders = false;
    this.inBody = false;

    return this;
}

exports.HTTPResponse = function () {
    this.initializeLine = [];
    this.headers = {};
    this.body = "";
    return this;

}

exports.createResponse = function (res){
    var nowString = "";
    nowString += res.initializeLine[0] + " " + res.initializeLine[1] + " " + res.initializeLine[2] + "\r\n";
    for (var head in res.headers)
    {
        nowString += head + ": " + res.headers[head] + "\r\n";
    }
    nowString += "\r\n";
    return nowString;
}

exports.parse.prototype.receiveData = function(data)
{
    var buff = data;
    if (!this.started)
    {
        var firstLine = buff.substr(0, buff.indexOf("\r\n"));
        this.request.initialLine = parseFirstLine(firstLine);
        if (this.request.initialLine[2] === "ico")
        {
            this.callback(null, "e");
            return;
        }
        buff = buff.substr(buff.indexOf("\r\n") + 2);
        this.started = true;
        this.inHeaders = true;
    }

    if (this.inHeaders)
    {

        while(buff != "")
        {

            var line = buff.substr(0, buff.indexOf("\r\n"));
            buff = buff.substr(buff.indexOf("\r\n") + 2);

            if ((line == "\r\n") || (line == ""))
            {
                this.inHeaders = false;
                this.inBody = true;
                break;
            }

            var header = line.substr(0, line.indexOf(":"));
            var value = parseValues(line.substr(line.indexOf(":") + 2));
            this.request.setHeader(header,value);
        }

    }


    if (this.inBody)
    {

        var currLength = this.request.body.length;
        var meanBodyLength = parseInt(this.request.getHeader('Content_Length')[0]);
        if (buff.length > meanBodyLength - currLength)
        {
            this.request.body += buff.substr(0, meanBodyLength - currLength);
            buff = buff.substr(meanBodyLength - currLength);
            this.inBody = false;
        }
        else
        {
            this.request.body += buff;
            buff = "";

            if (this.request.body.length === meanBodyLength)
            {
                this.inBody = false;
                this.callback(this.request, null);
                this.request = new HTTPRequest();
            }
        }
    }
}