/**
 * Created by danny on 11/01/15.
 */
var path = require('path');
var httpUtil = require('./hujiUtil');

exports.static = function (route) {

    var route = path.normalize('/' + route);

    return function (req, resp) {


        var requestedResource = path.join(route, path.normalize(req.path));
        requestedResource = path.join(path.resolve(route, __dirname), requestedResource);

        var content_type = httpUtil.getContentType(requestedResource);
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


