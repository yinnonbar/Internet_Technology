/**
 * Created by romcohen on 1/11/15.
 */

var httpUtil = require('./hujiUtil');

function BufferedParser(callback) {

    this.rollingRequest = httpUtil.createRequest();

    this.flagStarted = false;
    this.flagInHeader = false;
    this.flagInBody = false;
    this.callback = callback;
    this.rawBody = "";

    return this;

}

function parseURI(uri, request) {

    var queryStart = uri.indexOf('?');
    var poundStart = uri.indexOf('#');
    if (queryStart === -1) {
        queryStart = uri.length;
    }

    if (poundStart === -1) {
        poundStart = uri.length;
    }


    request.setPath(uri.substr(0, Math.min(poundStart, queryStart)));
    if (queryStart !== uri.length) {
        var queries;
        if (poundStart > queryStart) {
            queries = uri.substr(queryStart + 1, poundStart).split('&');
        } else {
            queries = uri.substr(queryStart + 1).split('&');
        }

        for (var query in queries) {
            var splitQuery = queries[query].split('=');
            if (splitQuery.length !== 2) {
                return false;
            }
            request.setQuery(splitQuery[0], splitQuery[1])
        }

    }


    return true;
};

BufferedParser.prototype.onDataReceived = function (data) {

    var buffer = data;



    // Get stater line
    if (!this.flagStarted) {
        var index = buffer.indexOf("\r\n");
        var startLine = buffer.substring(0, index);
        buffer = buffer.substr(index + 2);
        startLine = startLine.split(" ");

        this.rollingRequest.setMethod(startLine[0]);
        if (!parseURI(startLine[1], this.rollingRequest)) {
            this.callback(new Error("Bad parsing"), null);
            return;
        }
        var protocol = startLine[2].substr(startLine[2].indexOf("/") + 1);
        if (this.rollingRequest === undefined || (protocol !== "1.1" && protocol !== "1.0")) {

            this.callback(new Error("Bad parsing"), null);
            return;
        }
        this.rollingRequest.setProtocol(protocol);
        this.flagInHeader = true;
        this.flagStarted = true;
    }

    // Get headers
    if (this.flagInHeader) {
        var line;
        var prevHeader;
        var p = buffer.split("\r\n");

        while (buffer) {
            var index = buffer.indexOf("\r\n");
            line = buffer.substring(0, index);
            buffer = buffer.substr(index + 2);
            if (line === "\r\n" || line === "") {
                this.flagInHeader = false;
                this.flagInBody = true;
                break;
            } else if (line[0] === ' ' || line[0] === '\t') {
                line = line.trim();
                var oldHeader = this.rollingRequest.getHeader(prevHeader);
                this.rollingRequest.setHeader(prevHeader, oldHeader + line);
            } else {
                var lineSplit = line.split(":");
                if (lineSplit.length === 1) {
                    this.callback(new Error("Bad parsing"), null);
                }
                var headerName = lineSplit[0].replace(/[ \t]/g, "");

                var headerValue = lineSplit[1].replace("\r\n", "").replace(/[ \t]/g, "");
                if (headerName === "Cookie") {
                    var cookies = headerValue.split(';');
                    for (var cookie in cookies) {

                        var splitCookie = cookies[cookie].split('=');
                        this.rollingRequest.setCookie(splitCookie[0].trim(),
                            splitCookie[1].trim());
                    }
                } else {
                    this.rollingRequest.setHeader(headerName, headerValue);
                }
                prevHeader = lineSplit[0];
            }
        }
    }


    // Get rawBody
    if (this.flagInBody) {
        var content_length = this.rollingRequest.get("CONTENT-LENGTH");
        if (!content_length || content_length === '0') {
            this.flagInBody = false;
        } else {
            var currentBodyLength = this.rawBody.length;
            var contentLength = parseInt(this.rollingRequest.get("CONTENT-LENGTH"));


            if (buffer.length > contentLength - currentBodyLength) {
                this.rawBody += buffer.substr(0, contentLength - currentBodyLength);
                buffer = buffer.substr(contentLength - currentBodyLength);
                this.flagInBody = false;
            } else {
                this.rawBody += buffer;

                currentBodyLength += this.rawBody.length;

                buffer = "";
                if (currentBodyLength + buffer.length === contentLength) {
                    this.flagInBody = false;
                }
            }
        }
    }


    if (this.flagStarted && !this.flagInBody && !this.flagInHeader) {

        if (!this.rollingRequest.setBodyParams(this.rawBody)) {
            this.callback(new Error("Bad parsing"), null);
        } else {

            this.callback(null, this.rollingRequest);
        }
        this.flagStarted = false;
    }
};

exports.parse = function (string) {
    var bufferedParser = new BufferedParser(function () {
    });
    bufferedParser.onDataReceived(string);
    return bufferedParser.rollingRequest;
};

exports.stringify = function (httpResponse) {


    var returnString = "";
    returnString += "HTTP/" + httpResponse.protocol + " " + httpResponse.statusCode + " " +
    httpUtil.status_messages[httpResponse.statusCode];
    for (var header in httpResponse.headers) {
        returnString += "\r\n" + header + ": " + httpResponse.getHeader(header);
    }

    for (var cookieName in httpResponse.cookies) {
        var cookie = httpResponse.getCookie(cookieName);
        returnString += "\r\nSet-Cookie: " + cookieName + "=" + cookie.value;
        for (var cookieOptions in cookie) {
            if (cookie[cookieOptions] !== cookie.value) {
                returnString += "; " + cookieOptions + "=" + cookie[cookieOptions];
            }
        }

    }

    returnString += "\r\n\r\n";
    if (httpResponse.body) {
        returnString += httpResponse.body;
    }

    return returnString;
};

exports.BufferedParser = BufferedParser;