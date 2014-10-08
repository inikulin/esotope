/*
 Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var fs = require('fs'),
    esprima = require('./3rdparty/esprima-harmony'),
    escodegen = require('./loader'),
    chai = require('chai'),
    expect = chai.expect;

function test(code, expected) {
    var tree, actual, options, StringObject;

    // alias, so that JSLint does not complain.
    StringObject = String;

    options = {
        range: true,
        loc: false,
        tokens: true,
        raw: false
    };

    tree = esprima.parse(code, options);

    // for UNIX text comment
    actual = escodegen.generate(tree).replace(/[\n\r]$/, '') + '\n';
    actual = actual.replace(/\r\n?/g, '\n');
    expected = expected.replace(/\r\n?/g, '\n');
    expect(actual).to.be.equal(expected);
}

function testMin(code, expected) {
    var tree, tree2, actual, actual2, options, StringObject;

    // alias, so that JSLint does not complain.
    StringObject = String;

    options = {
        range: true,
        loc: false,
        tokens: true,
        raw: false
    };

    tree = esprima.parse(code, options);

    // for UNIX text comment
    actual = escodegen.generate(tree, {
        format: escodegen.FORMAT_MINIFY,
        raw: false
    }).replace(/[\n\r]$/, '') + '\n';
    actual = actual.replace(/\r\n?/g, '\n');
    expected = expected.replace(/\r\n?/g, '\n');
    expect(actual).to.be.equal(expected);

    // And ensure that minified value is exactly equal.
    tree2 = esprima.parse(actual, options);
    actual2 = escodegen.generate(tree2, {
        format: escodegen.FORMAT_MINIFY,
        raw: false
    }).replace(/[\n\r]$/, '') + '\n';
    actual = actual.replace(/\r\n?/g, '\n');
    actual2 = actual2.replace(/\r\n?/g, '\n');
    expect(actual2).to.be.equal(actual);
}

describe('compare harmony test', function () {
    fs.readdirSync(__dirname + '/compare-harmony').sort().forEach(function (file) {
        var code, expected, exp, min;
        if (/\.js$/.test(file) && !/expected\.js$/.test(file) && !/expected\.min\.js$/.test(file)) {
            it(file, function () {
                exp = file.replace(/\.js$/, '.expected.js');
                min = file.replace(/\.js$/, '.expected.min.js');
                code = fs.readFileSync(__dirname + '/compare-harmony/' + file, 'utf-8');
                expected = fs.readFileSync(__dirname + '/compare-harmony/' + exp, 'utf-8');
                test(code, expected);
                if (fs.existsSync(__dirname + '/compare-harmony/' + min)) {
                    expected = fs.readFileSync(__dirname + '/compare-harmony/' + min, 'utf-8');
                    testMin(code, expected);
                }
            });
        }
    });
});
/* vim: set sw=4 ts=4 et tw=80 : */
