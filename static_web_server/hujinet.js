/**
 * Created by eyal on 20/12/2015.
 */
var net = require("net");
var parser = require("./ParserHelper");
var path = require("path");
var fs = require("fs");

function ourServer(folder, callback) {
    var that = this;
    this.root = resolvePath(folder);
    this.callback = callback;

    this.tempServer = net.createServer(function (soc) {
            var ourParser = new parser.parse(function (req, e) {
                if (e) {
                    that.makeErrorResponse(soc);
                }
                else {
                    that.makeResponse(req, soc);
                }

            });
            soc.on("data", function (data) {

                ourParser.receiveData(data.toString());
            });
            soc.setTimeout(2000, function () {
                soc.end();
            });
        }
    )
    this.tempServer.on('error', function (err) {

        that.callback(err);
        that.callback = null;

    });

    this.tempServer.on('listening', function () {

        that.callback();
        that.callback = null;

    });
    return this;
}
ourServer.prototype.ourListen = function (port) {

    var that = this;

    fs.stat(this.root, function (e, stat) {

        if (e) {
            that.callback(e);
            that.callback = null;
            return;
        }

        if (stat.isDirectory()) {
            that.tempServer.listen(port);
        } else {
            that.callback(new Error("NOT A FOLDER :("));
            that.callback = null;
        }
    });

}

ourServer.prototype.stop = function(callback)
{
    ourServer.close(function(){callback()});
}

function resolvePath(rootFolder) {

    var root = path.normalize(rootFolder);

    return root;
}



exports.netObject = function (folder, callback) {
    var ourserver = new ourServer(folder, callback);
    return ourserver;


}

ourServer.prototype.makeErrorResponse = function (soc) {
    var httpRes = new parser.HTTPResponse();
    httpRes.initializeLine[0] = "HTTP/1.1";
    httpRes.initializeLine[1] = "400";
    httpRes.initializeLine[2] = "Bad request";
    httpRes.headers["Content_Length"] = 0;
    var resp = parser.createResponse(httpRes);
    soc.end(resp);
}
function send500Resp (socket) {
    var resp = parser.HTTPResponse();

    var respMessage = "500 Internal Server Error";
    resp.initializeLine[0] = "HTTP/1.1"
    resp.initializeLine[1] = "500";
    resp.initializeLine[2] ="Internal Server Error";
    resp.headers["Content_Type"] = "text/html";
    resp.headers["Date"] = new Date().toUTCString();
    resp.headers["Content_Length"] = respMessage.length;
    var data = parser.createResponse(resp);
    data += "<h1>" + respMessage + "</h1>"
    socket.end(data);
}

function send404Resp (socket) {
    var resp = parser.HTTPResponse();
    var respMessage = "404 File not found";
    resp.initializeLine[0] = "HTTP/1.1"
    resp.initializeLine[1] = "404";
    resp.initializeLine[2] ="File not found";
    resp.headers["Content_Type"] = "text/html";
    resp.headers["Date"] = new Date().toUTCString();
    resp.headers["Content_Length"] = respMessage.length;
    var data = parser.createResponse(resp);
    var img = "img404.jpg";
    data += "<h1>" + respMessage + "</h1> </br> <img src =  " + img + "> </img>";
    socket.end(data);
}

ourServer.prototype.checkRequest = function (req, file , callback)
{

    if (req.initialLine[0] != "GET" || !req.initialLine[2] in parser.legalExtensions) {

        callback("error", null);
    }
    else
    {
        fs.stat(file, function (e, stat) {
            if (e) {
                callback(null, "error");
            }
            else {
                if (!stat.isFile()) {
                    callback(null, "error");
                }
                callback(null, null);
            }
        });
    }

}

function goodResponse(req, soc,file)
{
    fs.stat(file, function (e, stat) {

        if (e) {
            console.log("error");
        }

        var contentLength = stat.size;
        var httpRes = parser.HTTPResponse();
        httpRes.initializeLine[0] = "HTTP/1.1";
        httpRes.initializeLine[1] = "200";
        httpRes.initializeLine[2] = "OK";
        httpRes.headers["Content_length"] = contentLength;
        httpRes.headers["Date"] = new Date().toUTCString();
        httpRes.headers["CONTENT_TYPE"] = parser.legalExtensions[req.initialLine[2]];
        var response = parser.createResponse(httpRes);
        soc.write(response, function () {
                    var readStream = fs.createReadStream(file);
                    readStream.on('open', function () {
                        readStream.pipe(soc);
                    });
                    readStream.on('error', function (err) {
                        soc.end(err);
                    });

                    readStream.on('end', function () {
                        soc.end();
                    });
                });
    });

}
ourServer.prototype.makeResponse = function (req, soc) {
    var file = this.root + req.initialLine[1] + "." + req.initialLine[2];

    this.checkRequest(req, file, function(e1, e2)
    {
        if (e1)
        {
            send500Resp(soc)
        }
        else if (e2)
        {
            send404Resp(soc)
        }
        else
        {
            goodResponse(req, soc, file);
        }
    });



}
function checkFolder(rootFolder) {
    fs.stat(rootFolder, function (e, stats) {
        if (e) {
            console.log("error");
            return false;
        }
        if (!stat.isDirectory()) {
            console.log("not a dir");
            return false;
        }
        return true;
    })
}
