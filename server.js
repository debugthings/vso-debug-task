const http = require('http');
var cnt = require('./controllers');


function getActions(url, querystring) {
    var parts = url.toLowerCase().split('/');
    if (cnt[parts[1]] != undefined || cnt[parts[1]] != null) {
        if (cnt[parts[1]].prototype[parts[2]] != undefined || cnt[parts[1]].prototype[parts[2]] != null) {
            var response = cnt[parts[1]].prototype[parts[2]]();
            return response;
        } else if (cnt[parts[1]].prototype['index'] != undefined || cnt[parts[1]].prototype['index'] != null) {
           var response2 = cnt[parts[1]].prototype[parts[2]]();
            return response2;
        }
    }
    return "404";
}


var server = http.createServer(function (request, response) {
    switch (request.method) {
        case "GET":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write("<!DOCTYPE \"html\">");
            response.write("<html>");
            response.write("<head>");
            response.write("<title>Help Page</title>");
            response.write("</head>");
            response.write("<body>");
            response.write(getActions(request.url, request.querystring))
            response.write("</body>");
            response.write("</html>");
            response.end();
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



function returnProcesses() {
    return "Process!";
}

server.listen(8888);
console.log("Server is listening");