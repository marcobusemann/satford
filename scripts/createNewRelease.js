const exec = require('child_process').exec;
const async = require('async');
const path = require('path');

const packageConfig = require(path.join(__dirname, '..', 'package.json'));

const commands = [
    'npm run build',
    'docker build -t blural/satford:latest .',
    'docker tag blural/satford:latest blural/satford:' + packageConfig.version
];

async.eachSeries(commands, (command, callback) => {
    exec(command, { pwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        logOutput(stdout, stderr);
        callback(error);
    });
}, (error) => {
    if (error)
        console.log(error);
});

function logOutput(stdout, stderr) {
    if (stdout)
        console.log(stdout);
    if (stderr)
        console.log(stderr);
}