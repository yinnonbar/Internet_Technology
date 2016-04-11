/**
 * Created by eyalvil on 7/01/16.
 */

var hujiMod = require('./hujiModules');

function Parser(callback) {

    this.request = hujiMod.createRequest();

    this.started = false;
    this.inHeaders = false;
    this.inBody = false;
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
            request.setQuery(splitQuery[0], splitQuery[1].replace("+", " "));
        }

    }


    return true;
};

Parser.prototype.onDataReceived = function (data) {

    var buffer = data;

    // Get stater line
    if (!this.started) {
        var index = buffer.indexOf("\r\n");
        var startLine = buffer.substring(0, index);
        buffer = buffer.substr(index + 2);
        startLine = startLine.split(" ");

        this.request.setMethod(startLine[0]);
        if (!parseURI(startLine[1], this.request)) {
            this.callback(new Error("Bad parsing"), null);
            return;
        }
        var protocol = startLine[2].substr(startLine[2].indexOf("/") + 1);
        if (this.request === undefined || (protocol !== "1.1" && protocol !== "1.0")) {
            this.callback(new Error("Bad parsing"), null);
            return;
        }
        this.request.setProtocol(protocol);
        this.inHeaders = true;
        this.started = true;
    }

    // Get headers
    if (this.inHeaders) {

        var line;
        var prevHeader;
        var p = buffer.split("\r\n");

        while (buffer) {
            var index = buffer.indexOf("\r\n");
            line = buffer.substring(0, index);
            buffer = buffer.substr(index + 2);
            if (line === "\r\n" || line === "") {
                this.inHeaders = false;
                this.inBody = true;
                break;
            } else if (line[0] === ' ' || line[0] === '\t') {
                line = line.trim();
                var oldHeader = this.request.getHeader(prevHeader);
                this.request.setHeader(prevHeader, oldHeader + line);
            } else {
                var lineSplit = line.split(":");
                if (lineSplit.length === 1) {
                    this.callback(new Error("Bad parsing"), null);
                }
                var headerName = lineSplit[0];
                var headerValue = "";
                if (lineSplit.length == 2)
                {
                    headerValue = lineSplit[1].replace("\r\n", "").substr(1);//.replace(/[ \t]/g, "");
                }
                else
                {
                    headerValue = (lineSplit[1] + ":" + lineSplit[2]).replace("\r\n", "").replace(/[ \t]/g, "");
                }
                if (headerName === "Cookie") {
                    var cookies = headerValue.split(';');
                    for (var cookie in cookies) {

                        var splitCookie = cookies[cookie].split('=');
                        this.request.setCookie(splitCookie[0].trim(),
                            splitCookie[1].trim());
                    }
                } else {
                    this.request.setHeader(headerName, headerValue);
                }
                prevHeader = lineSplit[0];
            }
        }
    }


    // Get rawBody
    if (this.inBody) {
        var content_length = this.request.get("CONTENT-LENGTH");
        if (!content_length || content_length === '0') {
            this.inBody = false;
        } else {
            var currentBodyLength = this.rawBody.length;
            var contentLength = parseInt(this.request.get("CONTENT-LENGTH"));


            if (buffer.length > contentLength - currentBodyLength) {
                this.rawBody += buffer.substr(0, contentLength - currentBodyLength);
                buffer = buffer.substr(contentLength - currentBodyLength);
                this.inBody = false;
            } else {
                this.rawBody += buffer;

                currentBodyLength += this.rawBody.length;

                buffer = "";
                if (currentBodyLength + buffer.length === contentLength) {
                    this.inBody = false;
                }
            }
        }
    }


    if (this.started && !this.inBody && !this.inHeaders) {
        if (!this.request.setBodyParams(this.rawBody)) {
            this.callback(new Error("Bad parsing"), null);
        } else {
            this.request.setHost(this.request.headers["HOST"])
            this.callback(null, this.request);
        }
        this.started = false;
    }
};

exports.parse = function (string) {
    var Parser = new Parser(function () {
    });
    Parser.onDataReceived(string);
    return Parser.request;
};

exports.stringify = function (httpResponse) {


    var returnString = "";
    returnString += "HTTP/" + "1.1" + " " + httpResponse.statusCode + " " +
    hujiMod.status_messages[httpResponse.statusCode];
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

exports.Parser = Parser;