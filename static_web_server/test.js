/**
 * Created by Yinnon Bratspiess on 28/12/2015.
 */
var huji = require("./hujiwebserver");
var http = require("http");
var fs = require("fs");

function runTests() {

    var test1 = {
        hostname: "localhost",
        port: 8888,
        path: 'localhost:8888F/index.html',
        method: 'GET'
    };

    var test2 = {
        hostname: 'localhost',
        port: 8888,
        path: 'localhost:8888/main.js',
        method: 'GET'
    };

    var test3 = {
        hostname: 'localhost',
        port: 8888,
        path: 'localhost:8888/style.css',
        method: 'GET'
    };

    http.get(test1, cb.bind(null, 1)).on('error', err.bind(null, 1));
    http.get(test2, cb.bind(null, 2)).on('error', err.bind(null, 2));
    http.get(test3, cb.bind(null, 3)).on('error', err.bind(null, 3));

}

var id = huji.start(8888, '', function (e) {
    if (e) {
        console.log(e);
    } else {
        //console.log(id.portNum);
        console.log('server ' + id + ' running');
        runTests();
    }
});

function cb(test, res) {

    var data = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        data += chunk.toString();
    });
    res.on('end', function () {
        onCbEnd(test, data);
    });
}

function onCbEnd(test, resData) {

    switch (test) {
        case 1:
            fs.readFile("index.html", function (err, data) {

                if (data.toString() !== resData) {
                    console.log("error test 1")
                } else {
                    console.log("ok test 1")
                }
            });
            break;
        case 2:
            fs.readFile("main.js", function (err, data) {
                if (data.toString() !== resData) {
                    console.log("error test 2")
                } else {
                    console.log("ok test 2")
                }
            });
            break;
        case 3:
            fs.readFile("style.css", function (err, data) {
                if (data.toString() !== resData) {
                    console.log("error test 3")
                } else {
                    console.log("ok test 3")
                }
            });
            break;

    }
}
function err(e) {
    console.log(e);
    console.log("Got error: " + e.message);
}
