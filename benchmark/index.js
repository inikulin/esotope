var Benchmark = require('benchmark'),
    upstream = require('escodegen'),
    workingCopy = require('../escodegen'),
    asts = require('./asts');


function cycle(codegen) {
    for (var i = 0; i < asts.length; i++)
        codegen.generate(asts[i]);
}

new Benchmark.Suite()
    .add('On steroids', function () {
        cycle(workingCopy);
    })
    
    .add('Upstream', function () {
        cycle(upstream);
    })

    .on('start', function () {
        console.log('Benchmarking...')
    })

    .on('cycle', function (event) {
        console.log(event.target.toString());
    })

    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));

        console.log('On steroids is x' + (this[0].hz / this[1].hz).toFixed(2) + ' times faster vs upstream.');
    })

    .run();
