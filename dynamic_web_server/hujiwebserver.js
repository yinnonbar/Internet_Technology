var hujidynamicserver = require('./hujidynamicserver');
var hujistaticserver = require('./hujistaticserver');

exports.start = function (port, callback) {


    hujidynamicserver.createServer(port, function (err, server) {

        callback(err, server);

    });

};

exports.static = hujistaticserver.static;

exports.myUse = function (userName, password) {

    const REMEMBERME_COOKIE = "rememberme";
    return function (req, resp, next) {

        if (req.cookies[REMEMBERME_COOKIE]) {
            next();
        } else {
            if (req.param("user") === userName && req.param("password") === password) {

                resp.cookie(REMEMBERME_COOKIE, "1", {path: "/"});
                next();
            } else {
                resp.status(401).send("Unauthorized access");
            }
        }
    };
};

exports.myUse.toString = "This function gets a user name and password as parameters and returns a resourceHandler " +
"function with 3 parameters (request response and next). The returned function checks if the request has the remmemberme" +
"cookie, if so it uses the given next. If not it checks if the request as the same username and password, create the" +
"remmemberme cookie the call the given next. Else send an error (401 status)";