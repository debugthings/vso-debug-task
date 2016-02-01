/// <reference path="./icontroller.ts" />
/// <reference path="../../../definitions/node.d.ts" />

var exec = require('child_process').spawn;
class Controllers  {
    class processes extends IController
    name: string;
    route: string;
    constructor() {
        super();
        this.registerForGet("allprocesses");
    }
    allprocesses()  {
        var stdoutbuffer: string;
        var child = exec('powershell', ['-command { Get-WmiObject -Query \"SELECT Name, IDProcess, WorkingSet, PercentProcessorTime FROM Win32_PerfFormattedData_PerfProc_Process\" | Select-Object Name, PercentProcessorTime | ConvertTo-Json }']);
        child.stdout.on("data", function(data) {
            console.log("Powershell Data: " + data);
        });
        child.stderr.on("data", function(data) {
            console.log("Powershell Errors: " + data);
        });
        child.on("exit", function() {
            console.log("Powershell Script finished");
        });
        child.stdin.end(); //end input
        return stdoutbuffer;
    }
}
}