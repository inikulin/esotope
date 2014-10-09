var asts = require('./asts'),
    workingCopy = require('../escodegen');

for (var j = 0; j < 50; j++) {
    for (var i = 0; i < asts.length; i++)
        workingCopy.generate(asts[i]);
}

workingCopy.printStats();