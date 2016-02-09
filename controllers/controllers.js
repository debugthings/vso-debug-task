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
            // Hard coded because well, it's just me writing this
            this.AllowedStaticTypes = ['gif', 'jpg', 'js', 'png', 'css'];
            this.AllowedStaticDirs = ['./img', './js', './css'];
            this.StaticResponsDir = './httpresponses/';
        }
        //Extract action
        // We're using a simple /controller/action/value
        IController.prototype.extractValue = function (request) {
            var urlParsed = url.parse(request.url, true);
            return urlParsed.pathname.split('/')[3];
        };
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
        IController.prototype.createCSSResponse = function (response) {
            response.setHeader("Content-Type", "text/css");
        };
        IController.prototype.createPNGResponse = function (response) {
            response.setHeader("Content-Type", "image/png");
        };
        IController.prototype.createJPGResponse = function (response) {
            response.setHeader("Content-Type", "image/jpeg");
        };
        IController.prototype.createGIFResponse = function (response) {
            response.setHeader("Content-Type", "image/gif");
        };
        IController.prototype.createJSResponse = function (response) {
            response.setHeader("Content-Type", "application/javascript");
        };
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
        IController.prototype.deniedResponse = function (response) {
            response.statusCode = 403;
        };
        IController.prototype.authResponse = function (response) {
            response.statusCode = 401;
        };
        // This needs to be the last item called for any file read operation as it ends the stream
        IController.prototype.readFileToStream = function (response, filename) {
            var readstream = this.readFileToStreamNoEnd(response, filename);
            readstream.on('end', function () { response.end(); });
        };
        // Read a file but do not end the stream
        IController.prototype.readFileToStreamNoEnd = function (response, filename) {
            var readstream = fs.createReadStream(filename);
            readstream.on('data', function (chunk) {
                response.write(chunk);
            });
            return readstream;
        };
        // Page Not Found (404)
        IController.prototype.notFound = function (response) {
            this.notFoundResponse(response);
            this.createHTMLResponse(response);
            this.readFileToStream(response, this.StaticResponsDir.concat('404.html'));
        };
        // Server error (500)
        IController.prototype.error = function (response) {
            this.errorResponse(response);
            this.createHTMLResponse(response);
            this.readFileToStream(response, this.StaticResponsDir.concat('500.html'));
        };
        return IController;
    })();
    var staticresponsecontroller = (function (_super) {
        __extends(staticresponsecontroller, _super);
        function staticresponsecontroller() {
            _super.call(this);
        }
        staticresponsecontroller.prototype.handle = function (request, response) {
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
        };
        return staticresponsecontroller;
    })(IController);
    Controllers.staticresponsecontroller = staticresponsecontroller;
    var filesystem = (function (_super) {
        __extends(filesystem, _super);
        function filesystem() {
            _super.call(this);
            this.registerForGet("file");
            this.registerForGet("directory");
        }
        // http://localhost/filesystem/file/get?filename=c:\file << download the file
        // http://localhost/filesystem/file/?filename=c:\file    << view file in browser
        filesystem.prototype.file = function (request, response) {
            var _this = this;
            var notfound = false;
            var fileaction = this.extractValue(request);
            fileaction = fileaction != undefined ? fileaction : 'get';
            var urlParsed = url.parse(request.url, true);
            var qsobject = urlParsed.query;
            var filename = qsobject['filename'];
            // Find the file, if it's not there return not found
            if (filename != null || filename != undefined) {
                fs.exists(filename, function (exists) {
                    if (exists) {
                        _super.prototype.goodResponse.call(_this, response);
                        if (fileaction == 'get') {
                            _super.prototype.createBinaryResponse.call(_this, response);
                            var header = 'attachment; filename=';
                            response.setHeader('Content-Disposition', header.concat(path.basename(filename)));
                        }
                        else {
                            _super.prototype.createTextResponse.call(_this, response);
                        }
                        _this.readFileToStream(response, filename);
                    }
                    else {
                        notfound = true;
                    }
                    if (notfound)
                        _this.notFound(response);
                });
            }
            else
                // The contract here is to have the filename as part of the URL, if not it's an error
                this.error(response);
        };
        // http://localhost/filesystem/directory/json?directory=c:\LR  << download the directory as JSON data
        // http://localhost/filesystem/directory/?directory=c:\LR      << view directory in browser
        filesystem.prototype.directory = function (request, response) {
            var _this = this;
            var fileaction = _super.prototype.extractValue.call(this, request);
            fileaction = fileaction != undefined ? fileaction : 'get';
            var urlParsed = url.parse(request.url, true);
            var qsobject = urlParsed.query;
            var directory = qsobject['directory'];
            //directory = path.dirname(directory);
            var directoryListing = {};
            if (directory != null || directory != undefined) {
                if (fs.exists(directory, function (exists) {
                    if (exists) {
                        _super.prototype.goodResponse.call(_this, response);
                        if (fileaction = 'json') {
                            fs.readdir(directory, function (err, files) {
                                _super.prototype.goodResponse.call(_this, response);
                                _super.prototype.createJSONResponse.call(_this, response);
                                response.write(JSON.stringify(files), function () {
                                    response.end();
                                });
                            });
                        }
                        else {
                        }
                    }
                    else {
                        _this.notFound(response);
                    }
                }))
                    ;
            }
            else {
                // Need to supply directory name.  There is no default action.
                this.error(response);
            }
        };
        return filesystem;
    })(IController);
    Controllers.filesystem = filesystem;
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
            this.registerForGet("process");
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
                response.write(stdout, function () {
                    response.end();
                });
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
            this.controllers = ['filesystem', 'process', 'debug'];
            this.filesystem = new filesystem();
            this.process = new processes();
            this.debug = new debuggers();
            this.staticresponsecontroller = new staticresponsecontroller();
        }
        return ControllerMain;
    })();
    Controllers.ControllerMain = ControllerMain;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
