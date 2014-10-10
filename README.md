### Esotope
[![Build Status](https://api.travis-ci.org/inikulin/esotope.svg)](https://travis-ci.org/inikulin/esotope)
*ECMAScript code generator on steroids*

Roadmap:

*  [x] Move generator units onto new wheels: use emit/expand
*  [x] Switch to the real generator instance
*  [x] Use direct concatenation instead of `g.emit`
*  [ ] Try to get rid from globals
*  [ ] Get rid from joins using post-processing
*  [ ] Unify GenOpts, so we can get rid of `generateExpression` and `generateStatement` (we can abandon verbatim for now)
*  [ ] Move generator units to generator prototype and use direct calls
*  [ ] Introduce slices
