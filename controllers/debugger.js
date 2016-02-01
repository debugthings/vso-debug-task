System.register([], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Controller;
    return {
        setters:[],
        execute: function() {
            /// <reference path="./icontroller.ts" />
            (function (Controller) {
                var debuggers = (function (_super) {
                    __extends(debuggers, _super);
                    function debuggers() {
                        _super.call(this);
                        this.registerForGet("allprocesses");
                    }
                    debuggers.prototype.allprocesses = function () {
                        return "Test";
                    };
                    return debuggers;
                })(IController);
            })(Controller = Controller || (Controller = {}));
            exports_1("Controller", Controller);
        }
    }
});
