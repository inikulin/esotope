### Esotope
[![Build Status](https://api.travis-ci.org/inikulin/esotope.svg)](https://travis-ci.org/inikulin/esotope)
*ECMAScript code generator on steroids*

Roadmap:

*  [ ] Move generator units onto new wheels: use emit/expand
*  [ ] Switch to the real generator instance
*  [ ] Use direct concatenation instead of `g.emit`
*  [ ] Unify GenOpts, so we can get rid of `generateExpression` and `generateStatement` (we can abandon verbatim for now)
*  [ ] Move generator units to generator prototype and use direct calls
*  [ ] Introduce slices
