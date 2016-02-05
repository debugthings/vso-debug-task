import http = require('http');
import url = require('url');
import quer = require('querystring')
import path = require('path');
import fs = require('fs');
import execFile = require('child_process');


export module Controllers {
    class IController {
        name: string = "";
        route: string = "";
        getfunctions: string[] = [];
        putfunctions: string[] = [];
        postfunctions: string[] = [];
        deletefunctions: string[] = [];
        // Hard coded because well, it's just me writing this
        AllowedStaticTypes: string[] = ['gif', 'jpg', 'js', 'png', 'css'];
        AllowedStaticDirs: string[] = ['./img', './js', './css'];
        StaticResponsDir: string = './httpresponses/';

        constructor() {
        }
        
        //Extract action
        // We're using a simple /controller/action/value
        extractValue(request: http.ServerRequest) {
            var urlParsed = url.parse(request.url, true);
            return urlParsed.pathname.split('/')[3];
        }
        
        // Register the method as a valid action
        registerForGet(fn) {
            this.getfunctions.push(fn);
        }
        registerForPut(fn) {
            this.putfunctions.push(fn);
        }
        registerForPost(fn) {
            this.postfunctions.push(fn);
        }
        registerForDelete(fn) {
            this.deletefunctions.push(fn);
        }

        // Check to see if this is registered for the action
        isGet(actionName: string): boolean {
            return this.getfunctions.indexOf(actionName) > -1;
        }
        isPut(actionName: string): boolean {
            return this.putfunctions.indexOf(actionName) > -1;
        }
        isPost(actionName: string): boolean {
            return this.postfunctions.indexOf(actionName) > -1;
        }
        isDelete(actionName: string): boolean {
            return this.deletefunctions.indexOf(actionName) > -1;
        }
        
        // Good response prototypes
        createCSSResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "text/css");
        }
        createPNGResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "image/png");
        }
        createJPGResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "image/jpeg");
        }
        createGIFResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "image/gif");
        }
        createJSResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "application/javascript");
        }
        createJSONResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "application/json");
        }
        createHTMLResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "text/html");
        }
        createTextResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "text/plain");
        }
        createZipResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "application/zip");
        }
        createBinaryResponse(response: http.ServerResponse) {
            response.setHeader("Content-Type", "application/octet-stream");
        }
        
       
        // Simple response codes
        goodResponse(response: http.ServerResponse) {
            response.statusCode = 200;
        }
        notFoundResponse(response: http.ServerResponse) {
            response.statusCode = 404;
        }
        errorResponse(response: http.ServerResponse) {
            response.statusCode = 500;
        }
        deniedResponse(response: http.ServerResponse) {
            response.statusCode = 403;
        }
        authResponse(response: http.ServerResponse) {
            response.statusCode = 401;
        }
        
        // This needs to be the last item called for any file read operation as it ends the stream
        readFileToStream(response: http.ServerResponse, filename: string) {
            var readstream = this.readFileToStreamNoEnd(response, filename);
            readstream.on('end', () => { response.end(); });
        }
        // Read a file but do not end the stream
        readFileToStreamNoEnd(response: http.ServerResponse, filename: string) {
            var readstream = fs.createReadStream(filename);
            readstream.on('data', (chunk) => {
                response.write(chunk);
            });
            return readstream;
        }
        
        // Page Not Found (404)
        notFound(response: http.ServerResponse) {
            this.notFoundResponse(response);
            this.createHTMLResponse(response);
            this.readFileToStream(response, this.StaticResponsDir.concat('404.html'));
        }
        // Server error (500)
        error(response: http.ServerResponse) {
            this.errorResponse(response);
            this.createHTMLResponse(response);
            this.readFileToStream(response, this.StaticResponsDir.concat('500.html'));
        }

    }
    export class staticresponsecontroller extends IController {
        constructor() {
            super();
        }
        handle(request: http.ServerRequest, response: http.ServerResponse): void {
            var urlParsed = url.parse(request.url, true);
            var fixedPath = '.'.concat(urlParsed.pathname);
            var exttype = path.extname(fixedPath);
            var notfound = false;
            if (this.AllowedStaticTypes.indexOf(path.extname(fixedPath)) > -1) {
                if (fs.existsSync(fixedPath))
                    this.readFileToStream(response, fixedPath);
                else
                    notfound = true;
            }
            if (notfound)
                this.notFound(response);
        }
    }

    export class filesystem extends IController {
        constructor() {
            super();
            this.registerForGet("files");
        }
        // http://localhost/filesystem/file/get?filename=c:\file << download the file
        // http://localhost/filesystem/file/?filename=c:\file    << view file in browser
        file(request: http.ServerRequest, response: http.ServerResponse): void {
            var notfound = false;
            var fileaction = this.extractValue(request);
            fileaction = fileaction != undefined ? fileaction : 'get';

            var urlParsed = url.parse(request.url, true);
            var qsobject = urlParsed.query;
            var filename = qsobject['filename'];
            
            // Find the file, if it's not there return not found
            if (filename != null || filename != undefined) {
                if (fs.existsSync(filename)) {
                    super.goodResponse(response);
                    if (fileaction == 'get') {
                        super.createBinaryResponse(response);
                        var header = 'attachment; filename=';
                        response.setHeader('Content-Disposition', header.concat(path.basename(filename)));
                    } else {
                        super.createTextResponse(response);
                    }
                    this.readFileToStream(response, filename);
                } else {
                    notfound = true;
                }
            }
            
            // The contract here is to have the filename as part of the URL, if not it's an error
            if (notfound)
                this.notFound(response);
            else
                this.error(response);
        }
        
        
        // http://localhost/filesystem/directory/json?directory=c:\LR  << download the directory as JSON data
        // http://localhost/filesystem/directory/?directory=c:\LR      << view directory in browser
        directory(request: http.ServerRequest, response: http.ServerResponse): void {
            var fileaction = this.extractValue(request);
            fileaction = fileaction != undefined ? fileaction : 'get';

            var urlParsed = url.parse(request.url, true);
            var qsobject = urlParsed.query;
            var directory = qsobject['directory'];
            directory = path.dirname(directory);

            if (directory != null || directory != undefined) {
                if (fs.existsSync(directory)) {
                    super.goodResponse(response);
                    if (fileaction = 'json') {
                        fs.readdir('./', (err: NodeJS.ErrnoException, files: string[]) => {
                            super.goodResponse(response);
                            super.createJSONResponse(response);
                            response.write(JSON.stringify(files));
                            response.end();
                        });
                    } else {
                        // Add in HTML operation here
                    }
                } else {
                    this.notFound(response);
                }
            } else {
                this.error(response);
            }
        }
    }
    export class debuggers extends IController {
        constructor() {
            super();
            this.route = "debugger";
            this.name = "Debuggers";
            this.registerForGet("allprocesses");
        }
        capturedump(): string {
            return "Test";
        }
    }

    export class processes extends IController {
        name: string;
        route: string;
        constructor() {
            super();
            this.registerForGet("allprocesses");
            this.registerForGet("process");
        }
        
        // Returns a list of processes and PIDs
        allprocesses(request: http.ServerRequest, response: http.ServerResponse): void {
            execFile.exec('powershell -command "Get-WmiObject -Query \'SELECT Name, IDProcess, WorkingSet, PercentProcessorTime FROM Win32_PerfFormattedData_PerfProc_Process\' | Select-Object Name, PercentProcessorTime | ConvertTo-Json"',
                (error, stdout, stderr) => {
                    if (error) {
                        this.errorResponse(response);
                    }
                    super.goodResponse(response);
                    super.createJSONResponse(response);
                    response.write(stdout);
                    response.end();
                });
        }
        // Takes the PID and gets the process details
        process(request: http.ServerRequest, response: http.ServerResponse): void {

        }
    }
    export class ControllerMain {
        filesystem: filesystem;
        process: processes;
        debug: debuggers;
        staticresponsecontroller: staticresponsecontroller;
        constructor() {
            this.filesystem = new filesystem();
            this.process = new processes();
            this.debug = new debuggers();
            this.staticresponsecontroller = new staticresponsecontroller();
        }
    }
}
