/**
 * Created by Yinnon Bratspiess on 28/12/2015.
 */
var huji = require('./hujiwebserver');
var http = require('http');

function load() {

    var agent = new http.Agent();
    agent.maxSockets = 2000000;

    var test1 = {
        hostname: 'localhost',
        port: 8888,
        path: 'localhost:8888/style.css',
        method: 'GET',
        agent: agent
    };

    for (var i = 0; i < 100; ++i) {
        //var test = require("./test");
        http.get(test1, function (res) {
        }).on('error', function (e) {
            if (e) {
                console.log(e.message);
            }

        });
    }
}
huji.start(8888, '', function (e) {
    load();
});