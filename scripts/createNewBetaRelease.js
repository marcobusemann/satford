const execCommands = require('./execCommands');
const path = require('path');

const packageConfig = require(path.join(__dirname, '..', 'package.json'));

const commands = [
    'npm run bundle',
    'docker build -t blural/satford:beta .',
    'docker tag blural/satford:beta blural/satford:' + packageConfig.version + '-beta',
    'docker push blural/satford:beta',
    'docker push blural/satford:' + packageConfig.version + '-beta',
];

execCommands(commands);