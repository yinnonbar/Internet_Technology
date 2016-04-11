///**
// * Created by eyalvil on 19/01/16.
// */
var hujiwebserver = require('./hujiwebserver');
var http = require('http');
//
//// test cookies
hujiwebserver.start(2000, function (err, server) {

    if (!err) {

        server.use('/admin/:user/:password', hujiwebserver.myUse("admin", "admin"));

        server.use('/admin/', function (req, resp, next) {

            var lv = req.cookies.lastvisit;

            var time = new Date().getTime();
            var string = lv ?
            "Hello again, you last visited " + ((time - lv) / 1000) + " seconds ago"
                : " Hello for the first time it's your first visit here";
            resp.cookie("lastvisit", time.toString()).send(string);


        });

        test({
            hostname: 'localhost',
            port: 2000,
            path: '/admin/admin/admin/',
            method: 'GET'
        }, {
            code: 200,
            body: " Hello for the first time it's your first visit here",
            testnum: "admin server 1"
        });
    }
    setTimeout(function() {server.stop();console.log("server shutdown")},2000);
});

// next function test
hujiwebserver.start(3000, function (err, server) {

    if (!err) {

        var a = true;
        server.use('/hello-world/', function (req, resp, next) {

            if (a) {
                resp.send("Hello world");
                a = false;
            } else {
                next();
            }
        });

        var b = true;
        server.use('/:param', function (req, resp, next) {

            if (b) {
                resp.send(req.params.param);
                b = false;
            } else {
                next();
            }

        });

        var d = true;
        server.use('/', function (req, resp, next) {

            if (d) {
                resp.send("Last hello world");
                d = false;
            } else {
                next();
            }

        });

    }


    test({
        hostname: 'localhost',
        port: 3000,
        path: '/hello-world/',
        method: 'GET'
    }, {
        code: 200,
        body: "Hello world",
        testnum: "hello world server 2 test 1"
    });


    test({
        hostname: 'localhost',
        port: 3000,
        path: '/hello-world/',
        method: 'GET'
    }, {
        code: 200,
        body: "hello-world",
        testnum: "hello world server 2 test 2"
    });


    test({
        hostname: 'localhost',
        port: 3000,
        path: '/hello-world/',
        method: 'GET'
    }, {
        code: 200,
        body: "Last hello world",
        testnum: "hello world server 2 test 3"
    });
    setTimeout(function() {server.stop();console.log("server shutdown")},2000);
});

hujiwebserver.start(4000, function (err, server) {

    if (!err) {

        server.use('/admin/', hujiwebserver.myUse("admin", "admin"));

        server.use('/admin/', function (resp, resp) {

            resp.send("OK");

        });

        server.use(hujiwebserver.static('/www/'));

        test({
            hostname: 'localhost',
            port: 4000,
            path: '/admin?user=admin&password=admin',
            method: 'GET'
        }, {
            code: 200,
            body: "OK",
            testnum: "Test query parsing: get method"
        });

        var str = "user=admin&password=admin";

        test({
            hostname: 'localhost',
            port: 4000,
            path: '/admin/',
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": str.length
            },
            body: "user=admin&password=admin"
        }, {
            code: 200,
            body: "OK",
            testnum: "Test query parsing: post method"
        });

        var user = JSON.stringify({user: "admin", password: "admin"});

        test({
            hostname: 'localhost',
            port: 4000,
            path: '/admin/',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Content-Length": user.length
            },
            body: user
        }, {
            code: 200,
            body: "OK",
            testnum: "Test query parsing: json method"
        });

    }
    setTimeout(function() {server.stop();console.log("server shutdown")},2000);

});

hujiwebserver.start(5000, function (err, server) {

    if (!err) {

        server.use('/admin/', hujiwebserver.myUse("admin", "admin"));

        server.use('/admin/', function (resp, resp) {

            resp.send("OK");

        });

        server.use(hujiwebserver.static('/www/'));

    }
    setTimeout(function() {server.stop();console.log("server shutdown")},2000);

});

//
hujiwebserver.start(1999, function (err, server) {
    if (!err) {
        server.use('/*', function (req, resp) {

            resp.send("Hello world");

        });
    } else {
        console.log(err);
    }


    var agent = new http.Agent();
    agent.maxSockets = 1000000;

    test({
        hostname: 'localhost',
        port: 1999,
        path: '/hello/',
        method: 'GET',
        agent: agent
    }, {
        code: 200,
        body: "Hello world",
        testnum: "hello world server 1"
    });

    setTimeout(function() {server.stop();console.log("server shutdown")},2000);
});


var test = function (options, except) {

    var func;
    if (options.method === "GET") {
        func = http.get;
    } else {
        func = http.request;
    }

    var req = func(options, function (res) {


        if (except.code === res.statusCode) {

            var data = [];
            res.on('data', function (chunk) {
                data.push(chunk.toString());
            });
            res.on('end', function () {
                var s = data.join("");
                if (except.body === s) {
                    console.log("Success: " + except.testnum);
                } else {
                    console.log("Failed: " + except.testnum);
                }
            })
        } else {
            console.log("Failed: " + except.testnum);
        }

    }).on('error', function (err) {

        console.log(err);
        console.log("Failed: " + except.testnum);
    });

    if (options.body) {
        req.write(options.body);
    }

    req.end();


};

