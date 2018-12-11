const execCommands = require('./execCommands');
const path = require('path');

const packageConfig = require(path.join(__dirname, '..', 'package.json'));

const commands = [
    'docker build -t blural/satford:latest .',
    'docker tag blural/satford:latest blural/satford:' + packageConfig.version,
    'docker push blural/satford:latest',
    'docker push blural/satford:' + packageConfig.version,
];

execCommands(commands);