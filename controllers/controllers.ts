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

        constructor() {
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
        
        // Page Not Found
        notFound(response: http.ServerResponse) {
            this.notFoundResponse(response);
            this.createHTMLResponse(response);

        }
    }

    export class tfsfiles extends IController {
        constructor() {
            super();
            this.registerForGet("files");
        }

        files(request: http.ServerRequest, response: http.ServerResponse): void {
            var urlParsed = url.parse(request.url, true);
            var fileaction = urlParsed.pathname.split('/')[3] != undefined ? urlParsed.pathname.split('/')[3] : 'get';
            var qsobject = urlParsed.query;
            var filename = qsobject['filename'];
            if (filename != null || filename != undefined) {
                fs.exists(filename, (exists: boolean) => {
                    super.goodResponse(response);
                    if (fileaction == 'get') {
                        super.createBinaryResponse(response);
                        //: <file name.ext>
                        var header = 'attachment; filename=';
                        response.setHeader('Content-Disposition', header.concat(path.basename(filename)));
                    } else {
                        super.createTextResponse(response);
                    }
                    var readstream = fs.createReadStream(filename);
                    readstream.on('data', (chunk) => {
                        response.write(chunk);
                    });
                    readstream.on('end', () => { response.end(); });

                });
            } else {
                fs.readdir('./', (err: NodeJS.ErrnoException, files: string[]) => {
                    super.goodResponse(response);
                    super.createJSONResponse(response);
                    response.write(JSON.stringify(files));
                    response.end();
                });
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
        files: tfsfiles;
        process: processes;
        debug: debuggers;
        constructor() {
            this.files = new tfsfiles();
            this.process = new processes();
            this.debug = new debuggers();

        }
    }
}
