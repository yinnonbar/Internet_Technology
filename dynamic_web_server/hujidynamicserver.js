var net = require('net');
var parser = require('./hujiparser');
var httpUtil = require('./hujiUtil');
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
                //console.log(params);
                req.params = params;
                var handler = handlers[i].requestHandler;
                try {
                    //console.log('AAAA');
                    ++i;
                    handler(req, resp, next);
                    //console.log("BBBB")
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
        console.log("failed");
        resp.status(404).send();

    }

    next();
}

function onSocketTimeout(socket) {

    socket.end();

}

function onBadHttpRequest(request, socket) {

    httpUtil.createResponse(request, socket, function () {
        socket.end();
    }).status(400).send();

}

function ServerWrapper(port, callback) {

    var that = this;

    this.handlers = [];

    var server = net.createServer(function (socket) {


        var bufferedParser = new parser.BufferedParser(function (e, req) {


            if (e) {
                onBadHttpRequest(req, socket);
            } else {

                socket.setTimeout(2000, function () {
                    console.log("closing connection");
                    socket.end();
                });

                var resp = httpUtil.createResponse(req, socket, function () {

                    var connectionHeader = req.get('CONNECTION');

                    if (req.httpVersion === 1.0 && connectionHeader && connectionHeader !== 'keep-alive') {
                        console.log("closing connection");
                        socket.end();
                    } else if (connectionHeader === 'Close') {
                        console.log("closing connection");
                        socket.end();
                    }

                });
                onHttpRequest(that.handlers, req, resp);
            }

        });

        socket.on('data', function (data) {


            socket.setTimeout(0);
            bufferedParser.onDataReceived(data.toString());

        });

        socket.setTimeout(2000, function () {

            onSocketTimeout(socket);

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

ServerWrapper.prototype.addHandler = function (resource, requestHandler, method) {

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
    //console.log(resource);
    //resource = path.normalize(resource).toString();
    resource = resource.toString();
    //console.log(resource);

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
    //console.log(req.path)

    //console.log(this.resource.regex);
    var retVal = {};


    // insert trailing slash
    if (path[path.length - 1] !== '/') {
        path = path + '/';
    }

   // console.log(path);
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

    var server = new ServerWrapper(port, function (err) {

        if (err) {
            callback(err);
        } else {
            callback(null, createServerHandler(server));
        }

    });

};