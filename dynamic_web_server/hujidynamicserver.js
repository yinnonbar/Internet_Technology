var net = require('net');
var parser = require('./parserHelper');
var httpMod = require('./hujiModules');
var fs = require('fs');
var path = require('path');

const ALL_METHODS = '*';
const TIMEOUT = 2000;

function onHttpRequest(handlers, req, resp) {

    var i = 0;

    function next() {

        while (i < handlers.length) {
            var params = handlers[i].canHandle(req);
            if (params) {
                req.params = params;
                var handler = handlers[i].requestHandler;
                try {
                    ++i;
                    handler(req, resp, next);
                    return;
                } catch (e) {
                    console.log(e);
                    resp.status(500).send("INTERNAL SERVER ERROR");
                    return;
                }
            }
            ++i;
        }

        // no handlers matched

        resp.status(404).send("The requested resource not found");

    }

    next();
}

function onsocTimeout(soc) {

    soc.end();

}

function onBadHttpRequest(request, soc) {

    httpMod.createResponse(request, soc, function () {
        soc.end();
    }).status(400).send();

}

function ourServer(port, callback) {

    var that = this;

    this.handlers = [];

    var server = net.createServer(function (soc) {


        var Parser = new parser.Parser(function (e, req) {


            if (e) {
                onBadHttpRequest(req, soc);
            } else {

                soc.setTimeout(2000, function () {
                    console.log("closing connection");
                    soc.end();
                });

                var resp = httpMod.createResponse(req, soc, function () {

                    var connectionHeader = req.get('CONNECTION');

                    if (req.httpVersion === 1.0 && connectionHeader && connectionHeader !== 'keep-alive') {
                        console.log("closing connection");
                        soc.end();
                    } else if (connectionHeader === 'Close') {
                        console.log("closing connection");
                        soc.end();
                    }

                });
                onHttpRequest(that.handlers, req, resp);
            }

        });

        soc.on('data', function (data) {


            soc.setTimeout(0);
            Parser.onDataReceived(data.toString());

        });

        soc.setTimeout(2000, function () {

            onsocTimeout(soc);

        });

    });

    server.on('error', function (err) {

        if (callback) {
            callback(err);
        }
        server

    });

    server.listen(port, function () {

        callback();

    });

    this.stop = function () {
        server.close();
    };

    return this;

}

ourServer.prototype.addHandler = function (resource, requestHandler, method) {

    if (typeof resource === 'function') {
        requestHandler = resource;
        resource = '/';
    } else if (typeof resource !== 'string') {
        return;
    } else if (typeof requestHandler !== 'function') {
        return;
    }

    method = method || ALL_METHODS;

    // create new RequestHandler object
    this.handlers.push(new RequestHandler(resource, requestHandler, method));

};

function RequestHandler(resource, requestHandler, method) {


    this.method = method;


    this.requestHandler = requestHandler;

    // clean up resource
    resource = resource.toString();


    // insert trailing slash
    if (resource[resource.length - 1] !== '/') {
        resource = resource + '/';
    }

    // make path start with '/'
    if (resource[0] != '/') {
        resource = '/' + resource;
    }

    this.resource = parseRequest(resource);

    return this;


    function parseRequest(resource) {

        var captureGroup = 1;
        const arr = resource.split('/');
        var counter = 0;

        var param = {};
        var newResource = [];
        newResource.push('^');

        for (var i = 1; i < arr.length; ++i) {



            // if last one isn't /
            if (newResource[newResource.length - 1] !== '/') {
                newResource.push('\\/');
            }

            if (arr[i][0] === ':') {
                newResource.push('([^\\/]+?)');
                var temp = arr[i].substr(1);
                param[captureGroup] = temp;
                captureGroup++;
                continue;
            }
            if (arr[i][0] === '*') {
                param[counter++] = captureGroup;
                newResource.push('(.*)');
                continue;
            }
            newResource.push(arr[i]);
        }
        newResource.push('(?:(?:\\/.*)?|$)');

        return {
            regex: new RegExp(newResource.join(""), "i"),
            param: param,
            resource: resource
        };
    }

}

RequestHandler.prototype.canHandle = function (req) {

    var path = req.path;
    var retVal = {};


    // insert trailing slash
    if (path[path.length - 1] !== '/') {
        path = path + '/';
    }


    var match = path.match(this.resource.regex);


    if (match) {

        var method = req.method;

        if (this.method !== '*' && this.method !== method) {
            return null;
        }


        var param = this.resource.param || {};

        for (var key in param) {
            retVal[param[key]] = match[key];
        }


        return retVal;

    } else {
        return null;
    }

};

function createServerHandler(server) {

    return {
        stop: function () {
            server.stop();

        },
        use: function (resource, requestHandler) {
            server.addHandler(resource, requestHandler);

        },
        get: function (resource, requestHandler) {
            server.addHandler(resource, requestHandler, "GET");

        },
        put: function (resource, requestHandler) {
            server.addHandler(resource, requestHandler, "PUT");

        },
        post: function (resource, requestHandler) {
            server.addHandler(resource, requestHandler, "POST");

        },
        delete: function (resource, requestHandler) {
            server.addHandler(resource, requestHandler, "DELETE");

        }
    };
}

exports.createServer = function (port, callback) {

    var server = new ourServer(port, function (err) {

        if (err) {
            callback(err);
        } else {
            callback(null, createServerHandler(server));
        }

    });

};