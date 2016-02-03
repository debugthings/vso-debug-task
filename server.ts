/// <reference path="../../definitions/vsts-task-lib.d.ts" />

import http = require('http');
import url = require('url');
import query = require('querystring')
import path = require('path');
import Controller = require('./controllers/controllers');

const Controllers = new Controller.Controllers.ControllerMain();

function getActions(request, response) {
    var urlParsed = url.parse(request.url, true);
    var parts = urlParsed.pathname.toLowerCase().split('/');
    var hasRoute = Controllers[parts[1]] != undefined;
    if (hasRoute) {
        var route = Controllers[parts[1]];
        var hasAction = route.isGet(parts[2]);
        if (hasAction) {
            var action = Controllers[parts[1]][parts[2]];
            action(request, response);
        } else {
            route.notFound(response);
        }
    }
}


var server = http.createServer(function(request, response) {
    switch (request.method) {
        case "GET":
            getActions(request, response);
            break;
        case "POST":
            break;
        case "PUT":
            break;
        case "DELETE":
            break;
        default:
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write("<!DOCTYPE \"html\">");
            response.write("<html>");
            response.write("<head>");
            response.write("<title>Hello World Page</title>");
            response.write("</head>");
            response.write("<body>");
            response.write("Hello World!");
            response.write("</body>");
            response.write("</html>");
            response.end();
            break;
    }

});

server.listen(8888);
console.log("Server is listening");