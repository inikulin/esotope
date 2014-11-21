#esotope
[![Build Status](https://api.travis-ci.org/inikulin/esotope.svg)](https://travis-ci.org/inikulin/esotope)

*ECMAScript code generator on steroids*

This project was started as a fork of the [escodegen](https://github.com/Constellation/escodegen) with intention to
speed up original code. *escodegen* is a great project, however it was constant bottleneck in our project, where we doing
real-time JavaScript code instrumentation. When nearly 70% of the original code was rewritten it become clear that it
can't be issued as a PR to the original repo and I decided to leave it as a standalone project. Currently esotope is x2
times faster than escodegen in node v0.10.x and x4.5 times faster in node v0.11.x ([benchmark](https://github.com/inikulin/esotope/tree/master/benchmark)).
However in production we've seen x10 times performance gain is some cases.

##Install
```
$ npm install esotope
```

##Usage
In general `esotope` can be used as a drop-in replacement for `escodegen`. So for the API-reference go to
[escodegen API page](https://github.com/Constellation/escodegen/wiki/API).

However, there are some missing features that
did not fit well into new design and were sacrificed for speed:

* Comments attachment
* Source maps

So, if you need comments or source maps you will need to fallback to the *escodegen*.

Also, Mozilla-specific obsolete ES6 syntax support were removed (`moz.starlessGenerator`, `moz.parenthesizedComprehensionBlock`,
`moz.comprehensionExpressionStartsWithAssignment` options).

##Testing
*esotope* inherits it's test suite from *escodegen*. To run tests (make sure you have [gulp](https://github.com/gulpjs/gulp/) installed):
```
$ gulp test
```

##Questions or suggestions?
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/esotope/issues).

##Author
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)
