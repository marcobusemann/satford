const exec = require('child_process').exec;
const async = require('async');
const path = require('path');

module.exports = function (commands) {
    async.eachSeries(commands, (command, callback) => {
        exec(command, { pwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
            logOutput(stdout, stderr);
            callback(error);
        });
    }, (error) => {
        if (error)
            console.log(error);
    });
}

function logOutput(stdout, stderr) {
    if (stdout)
        console.log(stdout);
    if (stderr)
        console.log(stderr);
}