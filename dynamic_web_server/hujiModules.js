/**
 * Created by romcohen on 12/28/14.
 */

var parser = require('./parserHelper');
var fs = require('fs');
var path = require('path');

// ---------------------------------- Http request
function HttpRequest() {
    this.headers = {
        CONTENT_LENGTH: 0
    };
    this.params = {};
    this.cookies = {};
    this.query = {};
    this.method = "";
    this.path = "";
    this.host = "";
    this.protocol = "";
    this.body = {};

    return this;
}
HttpRequest.prototype.is = function (content_type) {

    var thisContentType = this.get("ACCEPT");

    if (!thisContentType) {
        return true;
    }

    var types = thisContentType.split(/[,;]/i);

    for (var i = 0; i < types.length; ++i) {

        if (types[i] === "*/*" || types === content_type) {
            return true;
        }

    }


    return false;

};

HttpRequest.prototype.get = function (field) {
    return this.headers[field.toUpperCase()];
};

HttpRequest.prototype.setHeader = function (key, value) {
    this.headers[key.toUpperCase()] = value;
};

HttpRequest.prototype.param = function (paramName) {

    var returnParameter = this.params[paramName];
    if (returnParameter === undefined) {
        returnParameter = this.body[paramName];
    }
    if (returnParameter === undefined) {
        returnParameter = this.getQuery(paramName);
    }
    return returnParameter;
};

HttpRequest.prototype.setParam = function (key, value) {
    this.params[key.toUpperCase()] = value;
};


HttpRequest.prototype.setBodyParams = function (rawBody) {
    if (!rawBody) {
        return true;
    }

    if (this.headers['CONTENT-TYPE'].trim() === "application/json") {

        try {
            this.body = JSON.parse(rawBody);
        } catch (err) {

            return true;
        }
    } else if (this.headers['CONTENT-TYPE'].trim() === "application/x-www-form-urlencoded") {

        var splitBody;

        if (rawBody.indexOf('&') !== -1) {
            splitBody = rawBody.split('&');
        } else if (rawBody.indexOf(';') !== -1) {
            splitBody = rawBody.split(';');
        } else {
            return false;
        }


        for (var param in splitBody) {
            var splitParam = splitBody[param].split('=');
            if (splitParam.length !== 2) {
                return false;
            }
            this.body[splitParam[0]] = splitParam[1];
        }

    } else {

        this.body = rawBody;
    }


    return true;
};

HttpRequest.prototype.getPath = function () {
    return this.path;
};

HttpRequest.prototype.setPath = function (path) {
    this.path = path;
};

HttpRequest.prototype.getProtocol = function () {
    return "http"
};

HttpRequest.prototype.setProtocol = function (protocol) {
    this.protocol = "http";
};

HttpRequest.prototype.getHost = function () {
    return this.host;
};

HttpRequest.prototype.setHost = function (host) {
    this.host = host;
};
HttpRequest.prototype.getCookies = function () {
    return this.cookies;
};

HttpRequest.prototype.setCookie = function (name, val) {
    this.cookies[name] = val;
};

HttpRequest.prototype.getQuery = function (query) {
    return this.query[query];
};

HttpRequest.prototype.setQuery = function (field, value) {
    this.query[field] = value;
};

HttpRequest.prototype.getMethod = function (methodName) {
    return this.method[methodName.toUpperCase()];
};

HttpRequest.prototype.setMethod = function (method) {
    this.method = method.toUpperCase();
};

HttpRequest.prototype.getBody = function () {
    return this.body;
};

HttpRequest.prototype.setBody = function (body) {
    this.body = body;
};


exports.createRequest = function () {
    return new HttpRequest();
};

exports.methods = {
    GET: 0,
    HEAD: 1,
    POST: 2,
    PUT: 3,
    DELETE: 4,
    TRACE: 5,
    OPTIONS: 6,
    CONNECT: 7
};

// ---------------------------------- Http Response
function HttpResponse(request, socket, callback) {

    this.headers = {};

    this.cookies = {};

    this.statusCode = 200;

    this.socket = socket;

    this.sent = false;

    this.protocol = request ? request.protocol : "1.1";

    this.callback = callback;

    return this;
}

HttpResponse.prototype.json = function (body) {

    var stringResponse = JSON.stringify(body);
    var contentLength = stringResponse ? stringResponse.length : 0;
    this.setHeader('CONTENT-TYPE', "application/json");
    this.setHeader("CONTENT-LENGTH", contentLength);
    this.socket.write(stringResponse, function () {
        //this.callback(this);
        //this.callback();
    });
};

HttpResponse.prototype.send = function (body) {

    var that = this;

    if (!this.sent) {

        var contentType = this.getHeader('CONTENT-TYPE');

        this.body = "";


        if (typeof body === 'string') {
            if (contentType === undefined) {
                contentType = "text/html";
            }
            this.body = body;
        } else if (body instanceof Object) {
            if (body instanceof Buffer) {
                if (contentType === undefined) {
                    contentType = "text/html";
                }
                this.body = body.toString();
            } else {

                this.body = JSON.stringify(body);
                var contentLength = this.body ? this.body.length : 0;
                this.setHeader('CONTENT-TYPE', "application/json");
                this.setHeader("CONTENT-LENGTH", contentLength);
            }
        }
        var stringResponse = parser.stringify(this);

        this.socket.write(stringResponse, function () {

            that.callback(that);

        });
        this.sent = true;
    }
};

var possibleCookies = ["domain", "path", "secure", "expires", "maxAge", "httpOnly", "signed"];
var defaultCookieOptions = {
    path: "/"
};

HttpResponse.prototype.cookie = function (name, value, options) {
    var cookie = {
        value: value
    };
    options = options || {};
    for (var i = 0; i < possibleCookies.length; i++) {
        if (options[possibleCookies[i]]) {

            cookie[possibleCookies[i]] = options[possibleCookies[i]];
        } else if (defaultCookieOptions[possibleCookies[i]]) {
            cookie[possibleCookies[i]] = defaultCookieOptions[possibleCookies[i]];
        }
    }
    this.cookies[name] = cookie;

    return this;
};

HttpResponse.prototype.set = function (field, value) {
    if (arguments.length == 1)
    {
        for (var attrname in field) { this.headers[attrname.toUpperCase()] = field[attrname]; }
    }
    if (arguments.length === 2) {
        this.headers[field.toUpperCase()] = value;
    } else {
        for (var fieldType in field) {
            this.headers[fieldType.toUpperCase()] = field[fieldType];
        }

    }

    return this;
};

HttpResponse.prototype.getCookie = function (cookieName) {
    return this.cookies[cookieName];
};

HttpResponse.prototype.get = function (field) {
    return this.headers[field.toUpperCase()];
};

HttpResponse.prototype.status = function (code) {
    this.statusCode = code;

    return this;
};

HttpResponse.prototype.setHeader = function (key, value) {

    this.headers[key.toUpperCase()] = value;

};

HttpResponse.prototype.getHeader = function (key) {

    return this.headers[key.toUpperCase()];
};

exports.createResponse = function (request, socket, callback) {

    return new HttpResponse(request, socket, callback);
};

exports.status_messages = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Moved Temporarily',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Time-out',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Large',
    415: 'Unsupported Media Type',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Time-out',
    505: 'HTTP Version not supported'
};

exports.content_types = {
    "js": "application/javascript",
    "txt": "text/plain",
    "html": "text/html",
    "htm": "text/html",
    "css": "text/css",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif"
};

exports.getContentType = function getContentType(file_path) {

    var ext = path.extname(file_path);

    return exports.content_types[ext.substr(1, ext.length)];

};

HttpResponse.prototype.sendFile = function (file, callback) {

    var that = this;

    fs.stat(file, function (e, stat) {

        if (e) {
            callback(e);
            return;
        }

        if (stat.isDirectory()) {
            callback(new Error(file + " is directory"));
            return;
        }

        that.set({
            "CONTENT-LENGTH": stat.size.toString(),
            "CONTENT-TYPE": exports.getContentType(file)
        });

        var fileStream = fs.createReadStream(file);

        fileStream.on('open', function () {

            that.socket.write(new Buffer(parser.stringify(that)));
            fileStream.pipe(that.socket, {end: false});

        });

        fileStream.on('error', function () {

            callback(new Error("Resource error"));

        });

        fileStream.on('end', function () { // finished stream
            callback();
            that.callback(that);
        });

    });


};