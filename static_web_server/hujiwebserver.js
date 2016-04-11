/**
 * Created by eyal on 17/12/2015.
 */
var net = require('./hujinet');
exports.start = function (port, rootFolder, callback)
{
    server = net.netObject(rootFolder, function(err)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            callback();
        }
    });
    Object.defineProperty(server, 'portNum', {
            value : port,
            writable : false
        });
    Object.defineProperty(server, 'rootFolderPath',
        {
            value : rootFolder,
            writable : false
        });
    server.ourListen(port);
    return server;
}