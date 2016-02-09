/// <reference path="../../definitions/vsts-task-lib.d.ts" />
var http = require('http');
var url = require('url');
var Controller = require('./controllers/controllers');
var os = require('os');
var dns = require('dns');
var Controllers = new Controller.Controllers.ControllerMain();
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
        }
        else {
            route.notFound(response);
        }
    }
    else {
        Controllers.staticresponsecontroller.handle(request, response);
    }
}
var server = http.createServer(function (request, response) {
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
var active = server.listen(8888);
var req = http.request({
    hostname: 'whatsmyip.me',
    port: 80,
    path: '/',
    method: 'GET'
}, function (res) {
    var ipaddr;
    res.on('data', function (chunk) {
        ipaddr = chunk.toString().trim();
    });
    res.on('end', function () {
        dns.reverse(ipaddr, function (e, domains) {
            console.log("Server is listening on %s:%d", ipaddr, server.address().port);
            console.log("Hostname: %s", os.hostname());
            domains.forEach(function (element) {
                console.log("DNS Name: %s", element);
            });
        });
    });
});
req.end();
active.unref();
