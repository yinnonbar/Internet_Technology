/**
 * Created by yinnon on 11/01/16.
 */
var path = require('path');
var httpMod = require('./hujiModules');

exports.static = function (route) {

    var route = path.normalize('/' + route);

    return function (req, resp) {


        var requestedResource = path.join(route, path.normalize(req.path));
        requestedResource = path.join(path.resolve(route, __dirname), requestedResource);

        var content_type = httpMod.getContentType(requestedResource);
        if (req.is(content_type)) {

            resp.sendFile(requestedResource, function (err) {

                if (err) {
                    console.log(err);
                    resp.status(404).send("NOT FOUND");
                }

            });

        } else {
            resp.status(415).send("UNSUPPORTED MEDIA TYPE");
        }


    };

};


