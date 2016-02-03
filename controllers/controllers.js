var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var url = require('url');
var path = require('path');
var fs = require('fs');
var execFile = require('child_process');
var Controllers;
(function (Controllers) {
    var IController = (function () {
        function IController() {
            this.name = "";
            this.route = "";
            this.getfunctions = [];
            this.putfunctions = [];
            this.postfunctions = [];
            this.deletefunctions = [];
        }
        // Register the method as a valid action
        IController.prototype.registerForGet = function (fn) {
            this.getfunctions.push(fn);
        };
        IController.prototype.registerForPut = function (fn) {
            this.putfunctions.push(fn);
        };
        IController.prototype.registerForPost = function (fn) {
            this.postfunctions.push(fn);
        };
        IController.prototype.registerForDelete = function (fn) {
            this.deletefunctions.push(fn);
        };
        // Check to see if this is registered for the action
        IController.prototype.isGet = function (actionName) {
            return this.getfunctions.indexOf(actionName) > -1;
        };
        IController.prototype.isPut = function (actionName) {
            return this.putfunctions.indexOf(actionName) > -1;
        };
        IController.prototype.isPost = function (actionName) {
            return this.postfunctions.indexOf(actionName) > -1;
        };
        IController.prototype.isDelete = function (actionName) {
            return this.deletefunctions.indexOf(actionName) > -1;
        };
        // Good response prototypes
        IController.prototype.createJSONResponse = function (response) {
            response.setHeader("Content-Type", "application/json");
        };
        IController.prototype.createHTMLResponse = function (response) {
            response.setHeader("Content-Type", "text/html");
        };
        IController.prototype.createTextResponse = function (response) {
            response.setHeader("Content-Type", "text/plain");
        };
        IController.prototype.createZipResponse = function (response) {
            response.setHeader("Content-Type", "application/zip");
        };
        IController.prototype.createBinaryResponse = function (response) {
            response.setHeader("Content-Type", "application/octet-stream");
        };
        // Simple response codes
        IController.prototype.goodResponse = function (response) {
            response.statusCode = 200;
        };
        IController.prototype.notFoundResponse = function (response) {
            response.statusCode = 404;
        };
        IController.prototype.errorResponse = function (response) {
            response.statusCode = 500;
        };
        // Page Not Found
        IController.prototype.notFound = function (response) {
            this.notFoundResponse(response);
            this.createHTMLResponse(response);
        };
        return IController;
    })();
    var tfsfiles = (function (_super) {
        __extends(tfsfiles, _super);
        function tfsfiles() {
            _super.call(this);
            this.registerForGet("files");
        }
        tfsfiles.prototype.files = function (request, response) {
            var _this = this;
            var urlParsed = url.parse(request.url, true);
            var fileaction = urlParsed.pathname.split('/')[3] != undefined ? urlParsed.pathname.split('/')[3] : 'get';
            var qsobject = urlParsed.query;
            var filename = qsobject['filename'];
            if (filename != null || filename != undefined) {
                fs.exists(filename, function (exists) {
                    _super.prototype.goodResponse.call(_this, response);
                    if (fileaction == 'get') {
                        _super.prototype.createBinaryResponse.call(_this, response);
                        //: <file name.ext>
                        var header = 'attachment; filename=';
                        response.setHeader('Content-Disposition', header.concat(path.basename(filename)));
                    }
                    else {
                        _super.prototype.createTextResponse.call(_this, response);
                    }
                    var readstream = fs.createReadStream(filename);
                    readstream.on('data', function (chunk) {
                        response.write(chunk);
                    });
                    readstream.on('end', function () { response.end(); });
                });
            }
            else {
                fs.readdir('./', function (err, files) {
                    _super.prototype.goodResponse.call(_this, response);
                    _super.prototype.createJSONResponse.call(_this, response);
                    response.write(JSON.stringify(files));
                    response.end();
                });
            }
        };
        return tfsfiles;
    })(IController);
    Controllers.tfsfiles = tfsfiles;
    var debuggers = (function (_super) {
        __extends(debuggers, _super);
        function debuggers() {
            _super.call(this);
            this.route = "debugger";
            this.name = "Debuggers";
            this.registerForGet("allprocesses");
        }
        debuggers.prototype.capturedump = function () {
            return "Test";
        };
        return debuggers;
    })(IController);
    Controllers.debuggers = debuggers;
    var processes = (function (_super) {
        __extends(processes, _super);
        function processes() {
            _super.call(this);
            this.registerForGet("allprocesses");
        }
        // Returns a list of processes and PIDs
        processes.prototype.allprocesses = function (request, response) {
            var _this = this;
            execFile.exec('powershell -command "Get-WmiObject -Query \'SELECT Name, IDProcess, WorkingSet, PercentProcessorTime FROM Win32_PerfFormattedData_PerfProc_Process\' | Select-Object Name, PercentProcessorTime | ConvertTo-Json"', function (error, stdout, stderr) {
                if (error) {
                    _this.errorResponse(response);
                }
                _super.prototype.goodResponse.call(_this, response);
                _super.prototype.createJSONResponse.call(_this, response);
                response.write(stdout);
                response.end();
            });
        };
        // Takes the PID and gets the process details
        processes.prototype.process = function (request, response) {
        };
        return processes;
    })(IController);
    Controllers.processes = processes;
    var ControllerMain = (function () {
        function ControllerMain() {
            this.files = new tfsfiles();
            this.process = new processes();
            this.debug = new debuggers();
        }
        return ControllerMain;
    })();
    Controllers.ControllerMain = ControllerMain;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
