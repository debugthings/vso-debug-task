var IController = (function () {
    function IController() {
    }
    IController.prototype.registerForGet = function (fn) {
        this.getfunctions.concat(fn);
    };
    IController.prototype.registerForPut = function (fn) {
        this.getfunctions.concat(fn);
    };
    IController.prototype.registerForPost = function (fn) {
        this.getfunctions.concat(fn);
    };
    IController.prototype.registerForDeletet = function (fn) {
        this.getfunctions.concat(fn);
    };
    return IController;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="./icontroller.ts" />
var Controller;
(function (Controller) {
    var files = (function (_super) {
        __extends(files, _super);
        function files() {
            _super.call(this);
            this.registerForGet("allprocesses");
        }
        files.prototype.allprocesses = function () {
            return "Test";
        };
        return files;
    })(IController);
})(Controller || (Controller = {}));
/// <reference path="./icontroller.ts" />
/// <reference path="../../../definitions/node.d.ts" />
var exec = require('child_process').spawn;
var Controller;
(function (Controller) {
    var processes = (function (_super) {
        __extends(processes, _super);
        function processes() {
            _super.call(this);
            this.registerForGet("allprocesses");
        }
        processes.prototype.allprocesses = function () {
            var stdoutbuffer;
            var child = exec('powershell', ['-command { Get-WmiObject -Query \"SELECT Name, IDProcess, WorkingSet, PercentProcessorTime FROM Win32_PerfFormattedData_PerfProc_Process\" | Select-Object Name, PercentProcessorTime | ConvertTo-Json }']);
            child.stdout.on("data", function (data) {
                console.log("Powershell Data: " + data);
            });
            child.stderr.on("data", function (data) {
                console.log("Powershell Errors: " + data);
            });
            child.on("exit", function () {
                console.log("Powershell Script finished");
            });
            child.stdin.end(); //end input
            return stdoutbuffer;
        };
        return processes;
    })(IController);
})(Controller || (Controller = {}));
