/*
 Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
 Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
 Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
 Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
 Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
 Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
 Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
 Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
 Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
 Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

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

var isArray,
    indent,
    indentUnit,
    space,
    json,
    renumber,
    hexadecimal,
    quotes,
    escapeless,
    newline,
    optSpace,
    parentheses,
    semicolons,
    safeConcatenation,
    directive,
    extra,
    parse,
    FORMAT_MINIFY,
    FORMAT_DEFAULTS;

var esutils = require('esutils');

var Gen = {};

var Syntax = {
    AssignmentExpression: 'AssignmentExpression',
    ArrayExpression: 'ArrayExpression',
    ArrayPattern: 'ArrayPattern',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    BlockStatement: 'BlockStatement',
    BinaryExpression: 'BinaryExpression',
    BreakStatement: 'BreakStatement',
    CallExpression: 'CallExpression',
    CatchClause: 'CatchClause',
    ClassBody: 'ClassBody',
    ClassDeclaration: 'ClassDeclaration',
    ClassExpression: 'ClassExpression',
    ComprehensionBlock: 'ComprehensionBlock',
    ComprehensionExpression: 'ComprehensionExpression',
    ConditionalExpression: 'ConditionalExpression',
    ContinueStatement: 'ContinueStatement',
    DirectiveStatement: 'DirectiveStatement',
    DoWhileStatement: 'DoWhileStatement',
    DebuggerStatement: 'DebuggerStatement',
    EmptyStatement: 'EmptyStatement',
    ExportBatchSpecifier: 'ExportBatchSpecifier',
    ExportDeclaration: 'ExportDeclaration',
    ExportSpecifier: 'ExportSpecifier',
    ExpressionStatement: 'ExpressionStatement',
    ForStatement: 'ForStatement',
    ForInStatement: 'ForInStatement',
    ForOfStatement: 'ForOfStatement',
    FunctionDeclaration: 'FunctionDeclaration',
    FunctionExpression: 'FunctionExpression',
    GeneratorExpression: 'GeneratorExpression',
    Identifier: 'Identifier',
    IfStatement: 'IfStatement',
    ImportSpecifier: 'ImportSpecifier',
    ImportDeclaration: 'ImportDeclaration',
    Literal: 'Literal',
    LabeledStatement: 'LabeledStatement',
    LogicalExpression: 'LogicalExpression',
    MemberExpression: 'MemberExpression',
    MethodDefinition: 'MethodDefinition',
    ModuleDeclaration: 'ModuleDeclaration',
    NewExpression: 'NewExpression',
    ObjectExpression: 'ObjectExpression',
    ObjectPattern: 'ObjectPattern',
    Program: 'Program',
    Property: 'Property',
    ReturnStatement: 'ReturnStatement',
    SequenceExpression: 'SequenceExpression',
    SpreadElement: 'SpreadElement',
    SwitchStatement: 'SwitchStatement',
    SwitchCase: 'SwitchCase',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateElement: 'TemplateElement',
    TemplateLiteral: 'TemplateLiteral',
    ThisExpression: 'ThisExpression',
    ThrowStatement: 'ThrowStatement',
    TryStatement: 'TryStatement',
    UnaryExpression: 'UnaryExpression',
    UpdateExpression: 'UpdateExpression',
    VariableDeclaration: 'VariableDeclaration',
    VariableDeclarator: 'VariableDeclarator',
    WhileStatement: 'WhileStatement',
    WithStatement: 'WithStatement',
    YieldExpression: 'YieldExpression'
};

// Generation is done by generateExpression.
function isExpression(node) {
    switch (node.type) {
        case Syntax.AssignmentExpression:
        case Syntax.ArrayExpression:
        case Syntax.ArrayPattern:
        case Syntax.BinaryExpression:
        case Syntax.CallExpression:
        case Syntax.ConditionalExpression:
        case Syntax.ClassExpression:
        case Syntax.ExportBatchSpecifier:
        case Syntax.ExportSpecifier:
        case Syntax.FunctionExpression:
        case Syntax.Identifier:
        case Syntax.ImportSpecifier:
        case Syntax.Literal:
        case Syntax.LogicalExpression:
        case Syntax.MemberExpression:
        case Syntax.MethodDefinition:
        case Syntax.NewExpression:
        case Syntax.ObjectExpression:
        case Syntax.ObjectPattern:
        case Syntax.Property:
        case Syntax.SequenceExpression:
        case Syntax.ThisExpression:
        case Syntax.UnaryExpression:
        case Syntax.UpdateExpression:
        case Syntax.YieldExpression:
            return true;
    }
    return false;
}

// Generation is done by generateStatement.
function isStatement(node) {
    switch (node.type) {
        case Syntax.BlockStatement:
        case Syntax.BreakStatement:
        case Syntax.CatchClause:
        case Syntax.ContinueStatement:
        case Syntax.ClassDeclaration:
        case Syntax.ClassBody:
        case Syntax.DirectiveStatement:
        case Syntax.DoWhileStatement:
        case Syntax.DebuggerStatement:
        case Syntax.EmptyStatement:
        case Syntax.ExpressionStatement:
        case Syntax.ForStatement:
        case Syntax.ForInStatement:
        case Syntax.ForOfStatement:
        case Syntax.FunctionDeclaration:
        case Syntax.IfStatement:
        case Syntax.LabeledStatement:
        case Syntax.ModuleDeclaration:
        case Syntax.Program:
        case Syntax.ReturnStatement:
        case Syntax.SwitchStatement:
        case Syntax.SwitchCase:
        case Syntax.ThrowStatement:
        case Syntax.TryStatement:
        case Syntax.VariableDeclaration:
        case Syntax.VariableDeclarator:
        case Syntax.WhileStatement:
        case Syntax.WithStatement:
            return true;
    }
    return false;
}

var Precedence = {
    Sequence: 0,
    Yield: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    LogicalOR: 3,
    LogicalAND: 4,
    BitwiseOR: 5,
    BitwiseXOR: 6,
    BitwiseAND: 7,
    Equality: 8,
    Relational: 9,
    BitwiseSHIFT: 10,
    Additive: 11,
    Multiplicative: 12,
    Unary: 13,
    Postfix: 14,
    Call: 15,
    New: 16,
    TaggedTemplate: 17,
    Member: 18,
    Primary: 19
};

var BinaryPrecedence = {
    '||': Precedence.LogicalOR,
    '&&': Precedence.LogicalAND,
    '|': Precedence.BitwiseOR,
    '^': Precedence.BitwiseXOR,
    '&': Precedence.BitwiseAND,
    '==': Precedence.Equality,
    '!=': Precedence.Equality,
    '===': Precedence.Equality,
    '!==': Precedence.Equality,
    'is': Precedence.Equality,
    'isnt': Precedence.Equality,
    '<': Precedence.Relational,
    '>': Precedence.Relational,
    '<=': Precedence.Relational,
    '>=': Precedence.Relational,
    'in': Precedence.Relational,
    'instanceof': Precedence.Relational,
    '<<': Precedence.BitwiseSHIFT,
    '>>': Precedence.BitwiseSHIFT,
    '>>>': Precedence.BitwiseSHIFT,
    '+': Precedence.Additive,
    '-': Precedence.Additive,
    '*': Precedence.Multiplicative,
    '%': Precedence.Multiplicative,
    '/': Precedence.Multiplicative
};

function getDefaultOptions() {
    // default options
    return {
        indent: null,
        base: null,
        parse: null,
        format: {
            indent: {
                style: '    ',
                base: 0
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false
        },
        directive: false,
        raw: true,
        verbatim: null
    };
}

function fatalError(msg) {
    throw new Error(msg);
}

function stringRepeat(str, num) {
    var result = '';

    for (num |= 0; num > 0; num >>>= 1, str += str) {
        if (num & 1) {
            result += str;
        }
    }

    return result;
}

isArray = Array.isArray;
if (!isArray) {
    isArray = function isArray(array) {
        return Object.prototype.toString.call(array) === '[object Array]';
    };
}


function updateDeeply(target, override) {
    var key, val;

    function isHashObject(target) {
        return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
    }

    for (key in override) {
        if (override.hasOwnProperty(key)) {
            val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) {
                    updateDeeply(target[key], val);
                } else {
                    target[key] = updateDeeply({}, val);
                }
            } else {
                target[key] = val;
            }
        }
    }
    return target;
}

function generateNumber(value) {
    var result, point, temp, exponent, pos;

    if (value !== value) {
        fatalError('Numeric literal whose value is NaN');
    }
    if (value < 0 || (value === 0 && 1 / value < 0)) {
        fatalError('Numeric literal whose value is negative');
    }

    if (value === 1 / 0) {
        return json ? 'null' : renumber ? '1e400' : '1e+400';
    }

    result = '' + value;
    if (!renumber || result.length < 3) {
        return result;
    }

    point = result.indexOf('.');
    if (!json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {
        point = 0;
        result = result.slice(1);
    }
    temp = result;
    result = result.replace('e+', 'e');
    exponent = 0;
    if ((pos = temp.indexOf('e')) > 0) {
        exponent = +temp.slice(pos + 1);
        temp = temp.slice(0, pos);
    }
    if (point >= 0) {
        exponent -= temp.length - point - 1;
        temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
    }
    pos = 0;
    while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {
        --pos;
    }
    if (pos !== 0) {
        exponent -= pos;
        temp = temp.slice(0, pos);
    }
    if (exponent !== 0) {
        temp += 'e' + exponent;
    }
    if ((temp.length < result.length ||
         (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length
             < result.length)) &&
        +temp === value) {
        result = temp;
    }

    return result;
}

// Generate valid RegExp expression.
// This function is based on https://github.com/Constellation/iv Engine

function escapeRegExpCharacter(ch, previousIsBackslash) {
    // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
    if ((ch & ~1) === 0x2028) {
        return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
    } else if (ch === 10 || ch === 13) {  // \n, \r
        return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
    }
    return String.fromCharCode(ch);
}

function generateRegExp(reg) {
    var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

    result = reg.toString();

    if (reg.source) {
        // extract flag from toString result
        match = result.match(/\/([^/]*)$/);
        if (!match) {
            return result;
        }

        flags = match[1];
        result = '';

        characterInBrack = false;
        previousIsBackslash = false;
        for (i = 0, iz = reg.source.length; i < iz; ++i) {
            ch = reg.source.charCodeAt(i);

            if (!previousIsBackslash) {
                if (characterInBrack) {
                    if (ch === 93) {  // ]
                        characterInBrack = false;
                    }
                } else {
                    if (ch === 47) {  // /
                        result += '\\';
                    } else if (ch === 91) {  // [
                        characterInBrack = true;
                    }
                }
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                previousIsBackslash = ch === 92;  // \
            } else {
                // if new RegExp("\\\n') is provided, create /\n/
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                // prevent like /\\[/]/
                previousIsBackslash = false;
            }
        }

        return '/' + result + '/' + flags;
    }

    return result;
}

function escapeAllowedCharacter(code, next) {
    var hex, result = '\\';

    switch (code) {
        case 0x08  /* \b */
        :
            result += 'b';
            break;
        case 0x0C  /* \f */
        :
            result += 'f';
            break;
        case 0x09  /* \t */
        :
            result += 't';
            break;
        default:
            hex = code.toString(16).toUpperCase();
            if (json || code > 0xFF) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) {
                result += '0';
            } else if (code === 0x000B  /* \v */) { // '\v'
                result += 'x0B';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
    }

    return result;
}

function escapeDisallowedCharacter(code) {
    var result = '\\';
    switch (code) {
        case 0x5C  /* \ */
        :
            result += '\\';
            break;
        case 0x0A  /* \n */
        :
            result += 'n';
            break;
        case 0x0D  /* \r */
        :
            result += 'r';
            break;
        case 0x2028:
            result += 'u2028';
            break;
        case 0x2029:
            result += 'u2029';
            break;
        default:
            fatalError('Incorrectly classified character');
    }

    return result;
}

function escapeDirective(str) {
    var i, iz, code, quote;

    quote = quotes === 'double' ? '"' : '\'';
    for (i = 0, iz = str.length; i < iz; ++i) {
        code = str.charCodeAt(i);
        if (code === 0x27  /* ' */) {
            quote = '"';
            break;
        } else if (code === 0x22  /* " */) {
            quote = '\'';
            break;
        } else if (code === 0x5C  /* \ */) {
            ++i;
        }
    }

    return quote + str + quote;
}

function escapeString(str) {
    var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
    //TODO http://jsperf.com/character-counting/8
    for (i = 0, len = str.length; i < len; ++i) {
        code = str.charCodeAt(i);
        if (code === 0x27  /* ' */) {
            ++singleQuotes;
        } else if (code === 0x22  /* " */) {
            ++doubleQuotes;
        } else if (code === 0x2F  /* / */ && json) {
            result += '\\';
        } else if (esutils.code.isLineTerminator(code) || code === 0x5C  /* \ */) {
            result += escapeDisallowedCharacter(code);
            continue;
        } else if ((json && code < 0x20  /* SP */) ||
                   !(json || escapeless || (code >= 0x20  /* SP */ && code <= 0x7E  /* ~ */))) {
            result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
            continue;
        }
        result += String.fromCharCode(code);
    }

    single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
    quote = single ? '\'' : '"';

    if (!(single ? singleQuotes : doubleQuotes)) {
        return quote + result + quote;
    }

    str = result;
    result = quote;

    for (i = 0, len = str.length; i < len; ++i) {
        code = str.charCodeAt(i);
        if ((code === 0x27  /* ' */ && single) || (code === 0x22  /* " */ && !single)) {
            result += '\\';
        }
        result += String.fromCharCode(code);
    }

    return result + quote;
}

/**
 * flatten an array to a string, where the array can contain
 * either strings or nested arrays
 */
function flattenToString(arr) {
    var i, iz, elem, result = '';
    for (i = 0, iz = arr.length; i < iz; ++i) {
        elem = arr[i];
        result += isArray(elem) ? flattenToString(elem) : elem;
    }
    return result;
}

/**
 * convert generated to a SourceNode when source maps are enabled.
 */
function toSource(generated) {
    if (isArray(generated)) {
        return flattenToString(generated);
    }
    return generated;
}

function join(left, right) {
    var leftSource,
        rightSource,
        leftCharCode,
        rightCharCode;

    leftSource = toSource(left);
    if (leftSource.length === 0) {
        return [right];
    }

    rightSource = toSource(right);
    if (rightSource.length === 0) {
        return [left];
    }

    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
    rightCharCode = rightSource.charCodeAt(0);

    if ((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode ||
        esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode) ||
        leftCharCode === 0x2F  /* / */ && rightCharCode === 0x69  /* i */) { // infix word operators all start with `i`
        return [left, space, right];
    } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) ||
               esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
        return [left, right];
    }
    return [left, optSpace, right];
}

function sourceJoin(left, right) {
    return toSource(join(left, right));
}

function addIndent(stmt) {
    return [indent, stmt];
}

function withIndent(fn) {
    var previousBase, result;
    previousBase = indent;
    indent += indentUnit;
    //TODO THIS IS BAADDDDDDD!
    result = fn.call(this, indent);
    indent = previousBase;
    return result;
}

function parenthesize(text, current, should) {
    if (current < should) {
        return ['(', text, ')'];
    }
    return text;
}

function maybeBlock(g, stmt, semicolonOptional, functionBody) {
    var result;

    if (stmt.type === Syntax.BlockStatement) {
        return [optSpace, generateStatement(g, stmt, { functionBody: functionBody })];
    }

    if (stmt.type === Syntax.EmptyStatement) {
        return ';';
    }

    withIndent(function () {
        result = [newline, addIndent(generateStatement(g, stmt, { semicolonOptional: semicolonOptional, functionBody: functionBody }))];
    });

    return result;
}

function shiftIndent() {
    var prevIndent = indent;

    indent += indentUnit;
    return prevIndent;
}

function adoptionPrefix(stmt) {
    if (stmt.type === Syntax.BlockStatement)
        return optSpace;

    if (stmt.type === Syntax.EmptyStatement)
        return '';

    return newline + indent + indentUnit;
}

function adoptionSuffix(stmt) {
    if (stmt.type === Syntax.BlockStatement)
        return optSpace;

    return newline + indent;
}

/**
 * Subentities generators
 */
function generateVerbatim(g, expr, opt) {
    var verbatim = expr[extra.verbatim],
        strVerbatim = typeof verbatim === 'string',
        precedence = !strVerbatim && verbatim.precedence !== void 0 ? verbatim.precedence : Precedence.Sequence,
        parenthesize = precedence < opt.precedence,
        content = strVerbatim ? verbatim : verbatim.content,
        chunks = content.split(/\r\n|\n/),
        chunkCount = chunks.length;

    if (parenthesize)
        g.emit('(');

    g.emit(chunks[0]);

    for (var i = 1; i < chunkCount; i++)
        g.emit(newline + indent + chunks[i]);

    if (parenthesize)
        g.emit(')');
}

//TODO change this then we will move to real generator
function generateForIteratorVarId(g, node, options) {
    var result;

    if (node.type === Syntax.Identifier) {
        result = node.name;
    } else {
        result = generateExpression(g, node, {
            precedence: options.precedence,
            allowIn: options.allowIn,
            allowCall: true
        });
    }

    return result;
}

//TODO g
function generateFunctionParams(g, node) {
    var i, iz, result, hasDefault;

    hasDefault = false;

    if (node.type === Syntax.ArrowFunctionExpression && !node.rest && (!node.defaults || node.defaults.length === 0) &&
        node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
        // arg => { } case
        result = [node.params[0].name];
    } else {
        result = ['('];
        if (node.defaults) {
            hasDefault = true;
        }
        for (i = 0, iz = node.params.length; i < iz; ++i) {
            if (hasDefault && node.defaults[i]) {
                var fakeAssignExpr = {
                    type: Syntax.AssignmentExpression,
                    left: node.params[i],
                    right: node.defaults[i],
                    operator: '='
                };

                // Handle default values.
                result.push(generateExpression(g, fakeAssignExpr, {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                }));
            } else {
                result.push(generateForIteratorVarId(g, node.params[i], {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                }));
            }
            if (i + 1 < iz) {
                result.push(',' + optSpace);
            }
        }

        if (node.rest) {
            if (node.params.length) {
                result.push(',' + optSpace);
            }
            result.push('...');
            result.push(node.rest.name);
        }

        result.push(')');
    }

    return toSource(result);
}

function generateFunctionBody(g, node) {
    g.emit(generateFunctionParams(g, node));

    if (node.type === Syntax.ArrowFunctionExpression)
        g.emit(optSpace + '=>');

    if (node.expression) {
        g.emit(optSpace);

        var expr = g.generate(generateExpression, node.body, GenOpts.funcBodyExpr);

        if (expr.charAt(0) === '{')
            expr = '(' + expr + ')';

        g.emit(expr);
    }
    else {
        g.emit(adoptionPrefix(node.body));
        g.expand(generateStatement, node.body, GenOpts.funcBodyStmt);
    }
}

function generateForStatementIterator(g, operator, stmt, opt) {
    var prevIndent1 = shiftIndent(),
        js = 'for' + optSpace + '(';

    if (stmt.left.type === Syntax.VariableDeclaration) {
        var prevIndent2 = shiftIndent();
        js += stmt.left.kind + space;
        js += g.generate(generateStatement, stmt.left.declarations[0], GenOpts.forIterVarDecl);
        indent = prevIndent2;
    }

    else
        js += g.generate(generateExpression, stmt.left, GenOpts.forStmtIterLeft);

    js = sourceJoin(js, operator);

    var right = g.generate(generateExpression, stmt.right, GenOpts.forStmtIterRight);

    js = sourceJoin(js, right) + ')';

    indent = prevIndent1;

    g.emit(js + adoptionPrefix(stmt.body));
    g.expand(generateStatement, stmt.body, GenOpts.forStmtIterBody(opt.semicolon === ''));
}


function canUseRawLiteral(expr) {
    if (expr.hasOwnProperty('raw')) {
        try {
            var raw = parse(expr.raw).body[0].expression;

            return raw.type === Syntax.Literal && raw.value === expr.value;
        } catch (e) {
            // not use raw property
        }
    }

    return false;
}

function generateLiteral(g, expr) {
    if (parse && extra.raw && canUseRawLiteral(expr)) {
        return expr.raw;
    }

    if (expr.value === null) {
        return 'null';
    }

    var valueType = typeof expr.value;

    if (valueType === 'string') {
        return escapeString(expr.value);
    }

    if (valueType === 'number') {
        return generateNumber(expr.value);
    }

    if (valueType === 'boolean') {
        return expr.value ? 'true' : 'false';
    }

    return generateRegExp(expr.value);
}

/**
 * Generator unit options for various syntactic entities
 */
var GenOpts = {
    sequenceExprChildren: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true
        };
    },

    conditionalExprTest: function (allowIn) {
        return {
            precedence: Precedence.LogicalOR,
            allowIn: allowIn,
            allowCall: true
        };
    },

    conditionalExprBranch: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true
        };
    },

    callExprCallee: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: false
    },

    callExprArgs: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    blockStmtBodyItem: function (functionBody, semicolonOptional) {
        return {
            directiveContext: functionBody,
            semicolonOptional: semicolonOptional
        };
    },

    classBodyItem: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        type: Syntax.Property
    },

    classDeclarationSuperClass: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    classDeclarationBody: {
        semicolonOptional: true,
        directiveContext: false
    },

    varDeclaratorInit: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true
        };
    },

    varDeclaratorId: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn
        };
    },

    varDeclaration: function (allowIn) {
        return {
            allowIn: allowIn
        };
    },

    switchStmtDiscriminant: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    switchStmtCase: function (semicolonOptional) {
        return {
            semicolonOptional: semicolonOptional
        };
    },

    programBodyItem: function (semicolonOptional) {
        return {
            semicolonOptional: semicolonOptional,
            directiveContext: true
        };
    },

    newExprCallee: function (allowUnparenthesizedNew) {
        return {
            precedence: Precedence.New,
            allowIn: true,
            allowCall: false,
            allowUnparenthesizedNew: allowUnparenthesizedNew
        };
    },

    newExprArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    yieldExprArg: {
        precedence: Precedence.Yield,
        allowIn: true,
        allowCall: true
    },

    prefixUpdateExprArg: {
        precedence: Precedence.Unary,
        allowIn: true,
        allowCall: true
    },

    postfixUpdateExprArg: {
        precedence: Precedence.Postfix,
        allowIn: true,
        allowCall: true
    },

    arrayExprElement: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    classExprId: {
        allowIn: true,
        allowCall: true
    },

    classExprSuperClass: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    classExprBody: {
        semicolonOptional: true,
        directiveContext: false
    },

    propKey: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    propVal: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    objPatternProp: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    comprBlockVarDeclaration: {
        allowIn: false
    },

    comprBlockLeftExpr: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true
    },

    comprBlockRightExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    spreadElementArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    taggedTemplateExprTag: function (allowCall) {
        return {
            precedence: Precedence.Call,
            allowIn: true,
            allowCall: allowCall,
            allowUnparenthesizedNew: false
        };
    },

    taggedTemplateExprQuasi: {
        precedence: Precedence.Primary
    },

    templateLiteralQuasi: {
        precedence: Precedence.Primary,
        allowIn: true,
        allowCall: true
    },

    templateLiteralExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    throwStmtArg: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    objExprProperty: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        type: Syntax.Property
    },

    doWhileStmtBody: {
        functionBody: false,
        semicolonOptional: false
    },

    doWhileStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    catchClauseGuard: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    catchClauseParam: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    catchClauseBody: {
        functionBody: false,
        semicolonOptional: false
    },

    exprStmtExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    ifStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    ifStmtConseqWithAlt: {
        functionBody: false,
        semicolonOptional: false
    },

    ifStmtAlt: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    ifStmtConseq: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    returnStmtArg: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    whileStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    whileStmtBody: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    withStmtObj: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    withStmtBody: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    labeledStmtBody: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    forStmtVarInit: {
        allowIn: false
    },

    forStmtInit: {
        precedence: Precedence.Sequence,
        allowIn: false,
        allowCall: true
    },

    forStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    forStmtUpdate: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    forStmtBody: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    switchCaseTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    switchCaseConseqBlock: {
        functionBody: false,
        semicolonOptional: false
    },

    switchCaseConseq: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    exportDeclSpec: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    exportDeclDefaultDecl: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    exportDeclDecl: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    tryStmtBlock: {
        functionBody: false,
        semicolonOptional: false
    },

    tryStmtHandler: {
        functionBody: false,
        semicolonOptional: false
    },

    tryStmtFinalizer: {
        functionBody: false,
        semicolonOptional: false
    },

    memberExprObj: function (allowCall) {
        return {
            precedence: Precedence.Call,
            allowIn: true,
            allowCall: allowCall,
            allowUnparenthesizedNew: false
        };
    },

    memberExprProp: function (allowCall) {
        return {
            precedence: Precedence.Sequence,
            allowIn: true,
            allowCall: allowCall
        };
    },

    importDeclSpec: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    genExprBody: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    genExprBlock: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    genExprFilter: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    unaryExprArg: {
        precedence: Precedence.Unary,
        allowIn: true,
        allowCall: true
    },

    binExprOperand: function (precedence, allowIn) {
        return {
            precedence: precedence,
            allowIn: allowIn,
            allowCall: true
        };
    },

    forIterVarDecl: {
        allowIn: false
    },

    forStmtIterLeft: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true
    },

    forStmtIterRight: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    forStmtIterBody: function (semicolonOptional) {
        return {
            functionBody: false,
            semicolonOptional: semicolonOptional
        };
    },

    assignExprLeftOperand: function (allowIn) {
        return  {
            precedence: Precedence.Call,
            allowIn: allowIn,
            allowCall: true
        }
    },

    assignExprRightOperand: function (allowIn) {
        return  {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true
        }
    },

    funcBodyExpr: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    },

    funcBodyStmt: {
        functionBody: true,
        semicolonOptional: false
    }
};

//Expressions
//------------------------------------------------------------------------------------------------
Gen[Syntax.SequenceExpression] =
function generateSequenceExpression(g, expr, opt) {
    var len = expr.expressions.length,
        lastIdx = len - 1,
        parenthesize = Precedence.Sequence < opt.precedence,
        expandOpt = GenOpts.sequenceExprChildren(opt.allowIn || parenthesize);

    if (parenthesize)
        g.emit('(');

    for (var i = 0; i < len; i++) {
        g.expand(generateExpression, expr.expressions[i], expandOpt);

        if (i !== lastIdx)
            g.emit(',' + optSpace);
    }

    if (parenthesize)
        g.emit(')');
};


Gen[Syntax.AssignmentExpression] =
function generateAssignmentExpression(g, expr, opt) {
    var parenthesize = Precedence.Assignment < opt.precedence,
        allowIn = opt.allowIn || parenthesize;

    if (parenthesize)
        g.emit('(');

    g.expand(generateExpression, expr.left, GenOpts.assignExprLeftOperand(allowIn));
    g.emit(optSpace + expr.operator + optSpace);
    g.expand(generateExpression, expr.right, GenOpts.assignExprRightOperand(allowIn));

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.ArrowFunctionExpression] =
function generateArrowFunctionExpression(g, expr, opt) {
    var parenthesize = Precedence.ArrowFunction < opt.precedence;

    if (parenthesize)
        g.emit('(');

    generateFunctionBody(g, expr);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.ConditionalExpression] =
function generateConditionalExpression(g, expr, opt) {
    var parenthesize = Precedence.Conditional < opt.precedence,
        allowIn = opt.allowIn || parenthesize,
        testExpandOpt = GenOpts.conditionalExprTest(allowIn),
        branchExpandOpt = GenOpts.conditionalExprBranch(allowIn);

    if (parenthesize)
        g.emit('(');

    g.expand(generateExpression, expr.test, testExpandOpt);
    g.emit(optSpace + '?' + optSpace);
    g.expand(generateExpression, expr.consequent, branchExpandOpt);
    g.emit(optSpace + ':' + optSpace);
    g.expand(generateExpression, expr.alternate, branchExpandOpt);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.LogicalExpression] =
Gen[Syntax.BinaryExpression] =
function generateLogicalOrBinaryExpression(g, expr, opt) {
    var op = expr.operator,
        precedence = BinaryPrecedence[expr.operator],
        parenthesize = precedence < opt.precedence,
        allowIn = opt.allowIn || parenthesize,
        operandGenOpt = GenOpts.binExprOperand(precedence, allowIn),
        js = g.generate(generateExpression, expr.left, operandGenOpt);

    parenthesize |= op === 'in' && !allowIn;

    if (parenthesize)
        g.emit('(');

    if (js.charCodeAt(js.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(op.charCodeAt(0)))
        js = js + space + op;

    else
        js = sourceJoin(js, op);

    operandGenOpt.precedence++;

    var right = g.generate(generateExpression, expr.right, operandGenOpt);

    // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
    if (op === '/' && right.charAt(0) === '/' || op.slice(-1) === '<' && right.slice(0, 3) === '!--')
        js += space + right;

    else
        js = sourceJoin(js, right);

    g.emit(js);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.CallExpression] =
function generateCallExpression(g, expr, opt) {
    var argCount = expr['arguments'].length,
        lastArgIdx = argCount - 1,
        parenthesize = !opt.allowCall || Precedence.Call < opt.precedence;

    if (parenthesize)
        g.emit('(');

    g.expand(generateExpression, expr.callee, GenOpts.callExprCallee);
    g.emit('(');

    for (var i = 0; i < argCount; ++i) {
        g.expand(generateExpression, expr['arguments'][i], GenOpts.callExprArgs);

        if (i !== lastArgIdx)
            g.emit(',' + optSpace);
    }

    g.emit(')');

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.NewExpression] =
function generateNewExpression(g, expr, opt) {
    var parenthesize = Precedence.New < opt.precedence,
        argCount = expr['arguments'].length,
        lastArgIdx = argCount - 1,
        allowUnparenthesizedNew = opt.allowUnparenthesizedNew === void 0 || opt.allowUnparenthesizedNew,
        withCall = !allowUnparenthesizedNew || parentheses || argCount > 0,
        callee = g.generate(generateExpression, expr.callee, GenOpts.newExprCallee(!withCall));

    if (parenthesize)
        g.emit('(');

    g.emit(sourceJoin('new', callee));

    if (withCall) {
        g.emit('(');

        for (var i = 0; i < argCount; ++i) {
            g.expand(generateExpression, expr['arguments'][i], GenOpts.newExprArg);

            if (i !== lastArgIdx)
                g.emit(',' + optSpace);
        }

        g.emit(')');
    }

    if (parenthesize)
        g.emit(')');
};

var FLOATING_OR_OCTAL_REGEXP = /[.eExX]|^0[0-9]+|/,
    LAST_DECIMAL_DIGIT_REGEXP = /[0-9]$/;


Gen[Syntax.MemberExpression] =
function generateMemberExpression(g, expr, opt) {
    var parenthesize = Precedence.Member < opt.precedence;

    if (parenthesize)
        g.emit('(');

    if (!expr.computed && expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
        var num = g.generate(generateExpression, expr.object, GenOpts.memberExprObj(opt.allowCall));

        // When the following conditions are all true:
        //   1. No floating point
        //   2. Don't have exponents
        //   3. The last character is a decimal digit
        //   4. Not hexadecimal OR octal number literal
        // we should add a floating point.
        var withPoint = LAST_DECIMAL_DIGIT_REGEXP.test(num) && !FLOATING_OR_OCTAL_REGEXP.test(num);

        g.emit(withPoint ? (num + '.') : num);
    }

    else
        g.expand(generateExpression, expr.object, GenOpts.memberExprObj(opt.allowCall));

    if (expr.computed) {
        g.emit('[');
        g.expand(generateExpression, expr.property, GenOpts.memberExprProp(opt.allowCall));
        g.emit(']');
    }

    else
        g.emit('.' + expr.property.name);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.UnaryExpression] =
function generateUnaryExpression(g, expr, opt) {
    var parenthesize = Precedence.Unary < opt.precedence,
        op = expr.operator,
        arg = g.generate(generateExpression, expr.argument, GenOpts.unaryExprArg);

    if (parenthesize)
        g.emit('(');

    // delete, void, typeof
    // get `typeof []`, not `typeof[]`
    if (optSpace === '' || op.length > 2)
        g.emit(sourceJoin(op, arg));

    else {
        g.emit(op);

        // Prevent inserting spaces between operator and argument if it is unnecessary
        // like, `!cond`
        var left = op.charCodeAt(op.length - 1),
            right = arg.charCodeAt(0);

        if (((left === 0x2B  /* + */ || left === 0x2D  /* - */) && left === right) ||
            (esutils.code.isIdentifierPart(left) && esutils.code.isIdentifierPart(right))) {
            g.emit(space);
        }

        g.emit(arg);
    }

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.YieldExpression] =
function generateYieldExpression(g, expr, opt) {
    var js = expr.delegate ? 'yield*' : 'yield',
        parenthesize = Precedence.Yield < opt.precedence;

    if (parenthesize)
        g.emit('(');

    if (expr.argument) {
        var arg = g.generate(generateExpression, expr.argument, GenOpts.yieldExprArg);

        js = sourceJoin(js, arg);
    }

    g.emit(js);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.UpdateExpression] =
function generateUpdateExpression(g, expr, opt) {
    var precedence = expr.prefix ? Precedence.Unary : Precedence.Postfix,
        parenthesize = precedence < opt.precedence;

    if (parenthesize)
        g.emit('(');

    if (expr.prefix) {
        g.emit(expr.operator);
        g.expand(generateExpression, expr.argument, GenOpts.prefixUpdateExprArg);
    }

    else {
        g.expand(generateExpression, expr.argument, GenOpts.postfixUpdateExprArg);
        g.emit(expr.operator);
    }

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.FunctionExpression] =
function generateFunctionExpression(g, expr) {
    var isGenerator = !!expr.generator,
        js = isGenerator ? 'function*' : 'function';

    if (expr.id) {
        js += isGenerator ? optSpace : space;
        js += expr.id.name;
    }
    else
        js += optSpace;

    g.emit(js);
    generateFunctionBody(g, expr);
};

Gen[Syntax.ExportBatchSpecifier] =
function generateExportBatchSpecifier(g) {
    g.emit('*');
};

Gen[Syntax.ArrayPattern] =
Gen[Syntax.ArrayExpression] =
function generateArrayPatternOrExpression(g, expr) {
    var elemCount = expr.elements.length;

    if (elemCount) {
        var lastElemIdx = elemCount - 1,
            multiline = elemCount > 1,
            prevIndent = shiftIndent(),
            itemPrefix = newline + indent;

        g.emit('[');

        for (var i = 0; i < elemCount; i++) {
            if (multiline)
                g.emit(itemPrefix);

            if (expr.elements[i])
                g.expand(generateExpression, expr.elements[i], GenOpts.arrayExprElement);

            if (i !== lastElemIdx || !expr.elements[i])
                g.emit(',');
        }

        indent = prevIndent;

        if (multiline)
            g.emit(newline + indent);

        g.emit(']');
    }

    else
        g.emit('[]');
};

Gen[Syntax.ClassExpression] =
function generateClassExpression(g, expr) {
    var js = 'class';

    if (expr.id) {
        var id = g.generate(generateExpression, expr.id, GenOpts.classExprId);

        js = sourceJoin(js, id);
    }

    if (expr.superClass) {
        var superClass = g.generate(generateExpression, expr.superClass, GenOpts.classDeclarationSuperClass);

        superClass = sourceJoin('extends', superClass);
        js = sourceJoin(js, superClass);
    }

    g.emit(js + optSpace);
    g.expand(generateStatement, expr.body, GenOpts.classExprBody);
};

Gen[Syntax.MethodDefinition] =
function generateMethodDefinition(g, expr) {
    var js = expr['static'] ? 'static' + optSpace : '',
        propKey = g.generate(generateExpression, expr.key, expr.computed, GenOpts.propKey);

    if (expr.computed)
        propKey = '[' + propKey + ']';

    var body = g.generate(generateFunctionBody, expr.value),
        propKeyWithBody = propKey + body;

    if (expr.kind === 'get' || expr.kind === 'set') {
        propKeyWithBody = sourceJoin(expr.kind, propKeyWithBody);
        js = sourceJoin(js, propKeyWithBody);
    }

    else {
        if (expr.value.generator)
            js += '*' + propKeyWithBody;

        else
            js = sourceJoin(js, propKeyWithBody);
    }

    g.emit(js);
};

Gen[Syntax.Property] =
function generateProperty(g, expr) {
    var propKey = g.generate(generateExpression, expr.key, GenOpts.propKey);

    if (expr.computed)
        propKey = '[' + propKey + ']';

    if (expr.kind === 'get' || expr.kind === 'set') {
        g.emit(expr.kind + space + propKey);
        generateFunctionBody(g, expr.value);
    }

    else {
        if (expr.shorthand)
            g.emit(propKey);

        else if (expr.method) {
            g.emit(expr.value.generator ? ('*' + propKey) : propKey);
            generateFunctionBody(g, expr.value)
        }

        else {
            g.emit(propKey + ':' + optSpace);
            g.expand(generateExpression, expr.value, GenOpts.propVal);
        }
    }
};

Gen[Syntax.ObjectExpression] =
function generateObjectExpression(g, expr) {
    var propCount = expr.properties.length;

    if (propCount) {
        var lastPropIdx = propCount - 1,
            prevIndent = shiftIndent();

        g.emit('{');

        for (var i = 0; i < propCount; i++) {
            g.emit(newline + indent);
            g.expand(generateExpression, expr.properties[i], GenOpts.objExprProperty);

            if (i !== lastPropIdx)
                g.emit(',');
        }

        indent = prevIndent;
        g.emit(newline + indent + '}');
    }

    else
        g.emit('{}');
};

Gen[Syntax.ObjectPattern] =
function generateObjectPattern(g, expr) {
    var propCount = expr.properties.length;

    if (propCount) {
        var lastPropIdx = propCount - 1,
            multiline = false;

        if (expr.properties.length === 1)
            multiline = expr.properties[0].value.type !== Syntax.Identifier;

        else {
            for (var i = 0; i < propCount; i++) {
                if (!expr.properties[i].shorthand) {
                    multiline = true;
                    break;
                }
            }
        }

        g.emit(multiline ? ('{' + newline) : '{');

        var prevIndent = shiftIndent(),
            propSuffix = ',' + (multiline ? newline : optSpace);

        for (var i = 0; i < propCount; i++) {
            if (multiline)
                g.emit(indent);

            g.expand(generateExpression, expr.properties[i], GenOpts.objPatternProp);

            if (i !== lastPropIdx)
                g.emit(propSuffix);
        }

        indent = prevIndent;
        g.emit(multiline ? (newline + indent + '}') : '}');
    }
    else
        g.emit('{}');
};

Gen[Syntax.ThisExpression] =
function generateThisExpression(g) {
    g.emit('this');
};

Gen[Syntax.Identifier] = function generateIdentifier(g, node) {
    g.emit(node.name);
};

Gen[Syntax.ImportSpecifier] =
Gen[Syntax.ExportSpecifier] =
function generateImportOrExportSpecifier(g, expr) {
    var js = expr.id.name;

    if (expr.name)
        js += space + 'as' + space + expr.name.name;

    g.emit(js);
};


Gen[Syntax.Literal] = function (g, expr) {
    g.emit(generateLiteral(g, expr));
};

Gen[Syntax.GeneratorExpression] =
Gen[Syntax.ComprehensionExpression] =
function generateGeneratorOrComprehensionExpression(g, expr) {
    // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
    var isGenerator = expr.type === Syntax.GeneratorExpression,
        js = isGenerator ? '(' : '[',
        body = g.generate(generateExpression, expr.body, GenOpts.genExprBody);

    if (expr.blocks) {
        var prevIndent = shiftIndent(),
            blockCount = expr.blocks.length;

        for (var i = 0; i < blockCount; ++i) {
            var block = g.generate(generateExpression, expr.blocks[i], GenOpts.genExprBlock);

            js = i > 0 ? sourceJoin(js, block) : (js + block);
        }

        indent = prevIndent;
    }

    if (expr.filter) {
        var filter = g.generate(generateExpression, expr.filter, GenOpts.genExprFilter);
        js = sourceJoin(js, 'if' + optSpace);
        js = sourceJoin(js, '(' + filter + ')');
    }

    js = sourceJoin(js, body);
    js += isGenerator ? ')' : ']';

    g.emit(js);
};

Gen[Syntax.ComprehensionBlock] =
function generateComprehensionBlock(g, expr) {
    var left = void 0,
        right = g.generate(generateExpression, expr.right, GenOpts.comprBlockRightExpr);

    if (expr.left.type === Syntax.VariableDeclaration) {
        left = expr.left.kind +
               space +
               g.generate(generateStatement, expr.left.declarations[0], GenOpts.comprBlockVarDeclaration);
    }

    else
        left = g.generate(generateExpression, expr.left, GenOpts.comprBlockLeftExpr);

    left = sourceJoin(left, expr.of ? 'of' : 'in');

    g.emit('for' + optSpace + '(' + sourceJoin(left, right) + ')');
};

Gen[Syntax.SpreadElement] =
function generateSpreadElement(g, expr) {
    g.emit('...');
    g.expand(generateExpression, expr.argument, GenOpts.spreadElementArg);
};

Gen[Syntax.TaggedTemplateExpression] =
function generateTaggedTemplateExpression(g, expr, opt) {
    var parenthesize = Precedence.TaggedTemplate < opt.precedence;

    if (parenthesize)
        g.emit('(');

    g.expand(generateExpression, expr.tag, GenOpts.taggedTemplateExprTag(opt.allowCall));
    g.expand(generateExpression, expr.quasi, GenOpts.taggedTemplateExprQuasi);

    if (parenthesize)
        g.emit(')');
};

Gen[Syntax.TemplateElement] =
function generateTemplateElement(g, expr) {
    // Don't use "cooked". Since tagged template can use raw template
    // representation. So if we do so, it breaks the script semantics.
    g.emit(expr.value.raw);
};

Gen[Syntax.TemplateLiteral] =
function generateTemplateLiteral(g, expr) {
    var quasiCount = expr.quasis.length,
        lastQuasiIdx = quasiCount - 1;

    g.emit('`');

    for (var i = 0; i < quasiCount; ++i) {
        g.expand(generateExpression, expr.quasis[i], GenOpts.templateLiteralQuasi);

        if (i !== lastQuasiIdx) {
            g.emit('${' + optSpace);
            g.expand(generateExpression, expr.expressions[i], GenOpts.templateLiteralExpr);
            g.emit(optSpace + '}');
        }
    }

    g.emit('`');
};

function generateExpression(g, expr, option) {
    var result,
        precedence,
        type,
        allowIn,
        allowCall;

    precedence = option.precedence;
    allowIn = option.allowIn;
    allowCall = option.allowCall;
    type = expr.type || option.type;


    var gen = Gen[type];

    //TODO fake gen for now
    var fakeGen = {
        emit: function (generated) {
            result = result || '';
            result += generated;
        },
        expand: function (proc, node, opt) {
            var rr = proc(g, node, opt);

            if (rr !== void 0) {
                result = result || '';
                result += rr;
            }
        },
        generate: CodeGen.generate
    };

    if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
        return fakeGen.generate(generateVerbatim, expr, option);
    }

    else if (gen) {
        var rr = gen(fakeGen, expr, {
            precedence: precedence,
            allowIn: allowIn,
            allowCall: allowCall,
            type: type,
            allowUnparenthesizedNew: option.allowUnparenthesizedNew
        });
        if (rr !== void 0)
            result = rr;
    }

    else {
        fatalError('Unknown expression type: ' + expr.type);
    }

    return toSource(result);
}

//Statements
//------------------------------------------------------------------------------------------------

Gen[Syntax.BlockStatement] =
function generateBlockStatement(g, stmt, opt) {
    var len = stmt.body.length,
        lastIdx = len - 1,
        prevIndent = shiftIndent();

    g.emit('{' + newline);

    for (var i = 0; i < len; i++) {
        g.emit(indent);
        g.expand(generateStatement, stmt.body[i], GenOpts.blockStmtBodyItem(opt.functionBody, i === lastIdx));
        g.emit(newline);
    }

    indent = prevIndent;
    g.emit(indent + '}');
};

Gen[Syntax.BreakStatement] =
function generateBreakStatement(g, stmt, opt) {
    if (stmt.label)
        g.emit('break ' + stmt.label.name + opt.semicolon);

    else
        g.emit('break' + opt.semicolon);
};

Gen[Syntax.ContinueStatement] =
function generateContinueStatement(g, stmt, opt) {
    if (stmt.label)
        g.emit('continue ' + stmt.label.name + opt.semicolon);

    else
        g.emit('continue' + opt.semicolon);
};

Gen[Syntax.ClassBody] =
function generateClassBody(g, classBody) {
    var len = classBody.body.length,
        lastIdx = len - 1,
        prevIndent = shiftIndent();

    g.emit('{' + newline);

    for (var i = 0; i < len; i++) {
        g.emit(indent);
        g.expand(generateExpression, classBody.body[i], GenOpts.classBodyItem);

        if (i !== lastIdx)
            g.emit(newline);
    }

    indent = prevIndent;
    g.emit(newline + indent + '}');
};

Gen[Syntax.ClassDeclaration] =
function generateClassDeclaration(g, stmt) {
    var js = 'class ' + stmt.id.name;

    if (stmt.superClass) {
        var fragment = g.generate(generateExpression, stmt.superClass, GenOpts.classDeclarationSuperClass);

        js += space + sourceJoin('extends', fragment);
    }

    g.emit(js + optSpace);
    g.expand(generateStatement, stmt.body, GenOpts.classDeclarationBody);
};

Gen[Syntax.DirectiveStatement] =
function generateDirectiveStatement(g, stmt, opt) {
    if (extra.raw && stmt.raw)
        g.emit(stmt.raw + opt.semicolon);

    else
        g.emit(escapeDirective(stmt.directive) + opt.semicolon);
};

Gen[Syntax.DoWhileStatement] =
function generateDoWhileStatement(g, stmt, opt) {
    var body = adoptionPrefix(stmt.body) +
               g.generate(generateStatement, stmt.body, GenOpts.doWhileStmtBody) +
               adoptionSuffix(stmt.body);

    //NOTE: Because `do 42 while (cond)` is Syntax Error. We need semicolon.
    var js = sourceJoin('do', body);
    js = sourceJoin(js, 'while' + optSpace + '(');

    g.emit(js);
    g.expand(generateExpression, stmt.test, GenOpts.doWhileStmtTest);
    g.emit(')' + opt.semicolon);
};

Gen[Syntax.CatchClause] =
function generateCatchClause(g, stmt) {
    var prevIndent = shiftIndent();

    g.emit('catch' + optSpace + '(');
    g.expand(generateExpression, stmt.param, GenOpts.catchClauseParam);

    if (stmt.guard) {
        g.emit(' if ');
        g.expand(generateExpression, stmt.guard, GenOpts.catchClauseGuard);
    }

    indent = prevIndent;
    g.emit(')' + adoptionPrefix(stmt.body));
    g.expand(generateStatement, stmt.body, GenOpts.catchClauseBody);
};

Gen[Syntax.DebuggerStatement] =
function generateDebuggerStatement(g, stmt, opt) {
    g.emit('debugger' + opt.semicolon);
};

Gen[Syntax.EmptyStatement] =
function generateEmptyStatement(g) {
    g.emit(';');
};

Gen[Syntax.ExportDeclaration] =
function generateExportDeclaration(g, stmt, opt) {
    // export default AssignmentExpression[In] ;
    if (stmt['default']) {
        var decl = g.generate(generateExpression, stmt.declaration, GenOpts.exportDeclDefaultDecl);

        g.emit(sourceJoin('export default', decl) + opt.semicolon);
    }

    // export * FromClause ;
    // export ExportClause[NoReference] FromClause ;
    // export ExportClause ;
    else if (stmt.specifiers) {
        var js = 'export';

        if (stmt.specifiers.length === 0)
            js += optSpace + '{' + optSpace + '}';

        else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
            var spec = g.generate(generateExpression, stmt.specifiers[0], GenOpts.exportDeclSpec);

            js = sourceJoin(js, spec);
        }

        else {
            var prevIndent = shiftIndent(),
                specCount = stmt.specifiers.length,
                lastSpecIdx = specCount - 1;

            js += optSpace + '{';

            for (var i = 0; i < specCount; ++i) {
                js += newline + indent;
                js += g.generate(generateExpression, stmt.specifiers[i], GenOpts.exportDeclSpec);

                if (i !== lastSpecIdx)
                    js += ',';
            }

            indent = prevIndent;
            js += newline + indent + '}';
        }

        if (stmt.source)
            js = sourceJoin(js, 'from' + optSpace + generateLiteral(g, stmt.source));

        g.emit(js + opt.semicolon);

    }

    // export VariableStatement
    // export Declaration[Default]
    else if (stmt.declaration) {
        var decl = g.generate(generateStatement, stmt.declaration, GenOpts.exportDeclDecl(opt.semicolon === ''));

        g.emit(sourceJoin('export', decl));
    }
};

var EXPRESSION_STATEMENT_UNALLOWED_EXPR_REGEX = /^{|^class(?:\s|{)|^function(?:\s|\*|\()/;

Gen[Syntax.ExpressionStatement] =
function generateExpressionStatement(g, stmt, opt) {
    var exprSource = g.generate(generateExpression, stmt.expression, GenOpts.exprStmtExpr),
        parenthesize = EXPRESSION_STATEMENT_UNALLOWED_EXPR_REGEX.test(exprSource) ||
                       (directive &&
                        opt.directiveContext &&
                        stmt.expression.type === Syntax.Literal &&
                        typeof stmt.expression.value === 'string');

    // '{', 'function', 'class' are not allowed in expression statement.
    // Therefore, they should be parenthesized.
    if (parenthesize)
        g.emit('(' + exprSource + ')' + opt.semicolon);

    else
        g.emit(exprSource + opt.semicolon);
};


Gen[Syntax.ImportDeclaration] =
function generateImportDeclaration(g, stmt, opt) {
    var js = 'import',
        specCount = stmt.specifiers.length;

    // If no ImportClause is present,
    // this should be `import ModuleSpecifier` so skip `from`
    // ModuleSpecifier is StringLiteral.
    if (specCount) {
        var hasBinding = !!stmt.specifiers[0]['default'],
            firstNamedIdx = hasBinding ? 1 : 0,
            lastSpecIdx = specCount - 1;

        // ImportedBinding
        if (hasBinding)
            js = sourceJoin(js, stmt.specifiers[0].id.name);

        // NamedImports
        if (firstNamedIdx < specCount) {
            if (hasBinding)
                js += ',';

            js += optSpace + '{';

            // import { ... } from "...";
            if (firstNamedIdx === lastSpecIdx) {
                js += optSpace +
                      g.generate(generateExpression, stmt.specifiers[firstNamedIdx], GenOpts.importDeclSpec) +
                      optSpace;
            }

            else {
                var prevIndent = shiftIndent();

                // import {
                //    ...,
                //    ...,
                // } from "...";
                for (var i = firstNamedIdx; i < specCount; i++) {
                    js += newline +
                          indent +
                          g.generate(generateExpression, stmt.specifiers[i], GenOpts.importDeclSpec);

                    if (i !== lastSpecIdx)
                        js += ',';
                }

                indent = prevIndent;
                js += newline + indent;
            }

            js += '}' + optSpace;
        }

        js = sourceJoin(js, 'from')
    }

    js += optSpace + generateLiteral(g, stmt.source) + opt.semicolon;

    g.emit(js);
};

Gen[Syntax.VariableDeclarator] =
function generateVariableDeclarator(g, stmt, opt) {
    if (stmt.init) {
        var expandOpt = GenOpts.varDeclaratorInit(opt.allowIn);

        g.expand(generateExpression, stmt.id, expandOpt);
        g.emit(optSpace + '=' + optSpace);
        g.expand(generateExpression, stmt.init, expandOpt);
    }

    else
        g.expand(generateForIteratorVarId, stmt.id, GenOpts.varDeclaratorId(opt.allowIn));
};


Gen[Syntax.VariableDeclaration] =
function generateVariableDeclaration(g, stmt, opt) {
    var i = 0,
        len = stmt.declarations.length,
        prevIndent = len > 1 ? shiftIndent() : indent,
        expandOpt = GenOpts.varDeclaration(opt.allowIn);

    g.emit(stmt.kind);

    for (; i < len; i++) {
        g.emit(i === 0 ? space : (',' + optSpace));
        g.expand(generateStatement, stmt.declarations[i], expandOpt);
    }

    g.emit(opt.semicolon);
    indent = prevIndent;
};

Gen[Syntax.ThrowStatement] =
function generateThrowStatement(g, stmt, opt) {
    var arg = g.generate(generateExpression, stmt.argument, GenOpts.throwStmtArg);

    g.emit(sourceJoin('throw', arg) + opt.semicolon);
};

function generateTryStatementHandlers(g, js, finalizer, handlers) {
    var handlerCount = handlers.length,
        lastHandlerIdx = handlerCount - 1;

    for (var i = 0; i < handlerCount; ++i) {
        var handler = g.generate(generateStatement, handlers[i], GenOpts.tryStmtHandler);

        js = sourceJoin(js, handler);

        if (finalizer || i !== lastHandlerIdx)
            js += adoptionSuffix(handlers[i].body);
    }

    return js;
}

Gen[Syntax.TryStatement] =
function generateTryStatement(g, stmt) {
    var js = 'try' +
             adoptionPrefix(stmt.block) +
             g.generate(generateStatement, stmt.block, GenOpts.tryStmtBlock) +
             adoptionSuffix(stmt.block);

    var handlers = stmt.handlers || stmt.guardedHandlers;

    if (handlers)
        js = generateTryStatementHandlers(g, js, stmt.finalizer, handlers);

    if (stmt.handler) {
        handlers = isArray(stmt.handler) ? stmt.handler : [stmt.handler];
        js = generateTryStatementHandlers(g, js, stmt.finalizer, handlers);
    }

    if (stmt.finalizer) {
        js = sourceJoin(js, 'finally' + adoptionPrefix(stmt.finalizer));
        js += g.generate(generateStatement, stmt.finalizer, GenOpts.tryStmtFinalizer);
    }

    g.emit(js);
};

Gen[Syntax.SwitchStatement] =
function generateSwitchStatement(g, stmt) {
    var prevIndent = shiftIndent();

    g.emit('switch' + optSpace + '(');
    g.expand(generateExpression, stmt.discriminant, GenOpts.switchStmtDiscriminant);
    g.emit(')' + optSpace + '{' + newline);
    indent = prevIndent;

    if (stmt.cases) {
        var len = stmt.cases.length,
            lastIdx = len - 1;

        for (var i = 0; i < len; i++) {
            g.emit(indent);
            g.expand(generateStatement, stmt.cases[i], GenOpts.switchStmtCase(i === lastIdx));
            g.emit(newline);
        }
    }

    g.emit(indent + '}');
};


Gen[Syntax.SwitchCase] =
function generateSwitchCase(g, stmt, opt) {
    var i = 0,
        prevIndent = shiftIndent(),
        conseqCount = stmt.consequent.length,
        lastConseqIdx = conseqCount - 1;

    if (stmt.test) {
        var test = g.generate(generateExpression, stmt.test, GenOpts.switchCaseTest);
        g.emit(sourceJoin('case', test) + ':');
    }

    else
        g.emit('default:');


    if (conseqCount && stmt.consequent[0].type === Syntax.BlockStatement) {
        i++;
        g.emit(adoptionPrefix(stmt.consequent[0]));
        g.expand(generateStatement, stmt.consequent[0], GenOpts.switchCaseConseqBlock);
    }

    for (; i < conseqCount; i++) {
        g.emit(newline + indent);
        g.expand(generateStatement, stmt.consequent[i], GenOpts.switchCaseConseq(i === lastConseqIdx &&
                                                                                 opt.semicolon === ''));
    }

    indent = prevIndent;
};

Gen[Syntax.IfStatement] =
function generateIfStatement(g, stmt, opt) {
    var prevIndent = shiftIndent(),
        semicolonOptional = opt.semicolon === '';

    g.emit('if' + optSpace + '(');
    g.expand(generateExpression, stmt.test, GenOpts.ifStmtTest);
    g.emit(')');
    indent = prevIndent;
    g.emit(adoptionPrefix(stmt.consequent));

    if (stmt.alternate) {
        var conseq = g.generate(generateStatement, stmt.consequent, GenOpts.ifStmtConseqWithAlt) +
                     adoptionSuffix(stmt.consequent),
            alt = g.generate(generateStatement, stmt.alternate, GenOpts.ifStmtAlt(semicolonOptional));

        if (stmt.alternate.type === Syntax.IfStatement)
            alt = 'else ' + alt;

        else
            alt = sourceJoin('else', adoptionPrefix(stmt.alternate) + alt);

        g.emit(sourceJoin(conseq, alt));
    }

    else
        g.expand(generateStatement, stmt.consequent, GenOpts.ifStmtConseq(semicolonOptional))
};


Gen[Syntax.ForStatement] =
function generateForStatement(g, stmt, opt) {
    var prevIndent = shiftIndent();

    g.emit('for' + optSpace + '(');

    if (stmt.init) {
        if (stmt.init.type === Syntax.VariableDeclaration)
            g.expand(generateStatement, stmt.init, GenOpts.forStmtVarInit);

        else {
            g.expand(generateExpression, stmt.init, GenOpts.forStmtInit);
            g.emit(';');
        }
    }

    else
        g.emit(';');

    if (stmt.test) {
        g.emit(optSpace);
        g.expand(generateExpression, stmt.test, GenOpts.forStmtTest);
    }

    g.emit(';');

    if (stmt.update) {
        g.emit(optSpace);
        g.expand(generateExpression, stmt.update, GenOpts.forStmtUpdate);
    }

    g.emit(')');

    indent = prevIndent;

    g.emit(adoptionPrefix(stmt.body));
    g.expand(generateStatement, stmt.body, GenOpts.forStmtBody(opt.semicolon === ''));
};

Gen[Syntax.ForInStatement] =
function generateForInStatement(g, stmt, opt) {
    generateForStatementIterator(g, 'in', stmt, opt);
};

Gen[Syntax.ForOfStatement] =
function generateForOfStatement(g, stmt, opt) {
    generateForStatementIterator(g, 'of', stmt, opt);
};


Gen[Syntax.LabeledStatement] =
function generateLabeledStatement(g, stmt, opt) {
    var prevIndent = indent;

    g.emit(stmt.label.name + ':' + adoptionPrefix(stmt.body));

    if (stmt.body.type !== Syntax.BlockStatement)
        prevIndent = shiftIndent();

    g.expand(generateStatement, stmt.body, GenOpts.labeledStmtBody(opt.semicolon === ''));
    indent = prevIndent;
};

Gen[Syntax.ModuleDeclaration] =
function generateModuleDeclaration(g, stmt, opt) {
    g.emit('module' + space + stmt.id.name + space +
           'from' + optSpace + generateLiteral(g, stmt.source) + opt.semicolon);
};

Gen[Syntax.Program] =
function generateProgram(g, stmt) {
    var len = stmt.body.length,
        lastIdx = len - 1;

    if (safeConcatenation && len > 0)
        g.emit('\n');

    for (var i = 0; i < len; i++) {
        g.emit(indent);
        g.expand(generateStatement, stmt.body[i], GenOpts.programBodyItem(!safeConcatenation && i === lastIdx));

        if (i !== lastIdx)
            g.emit(newline);
    }
};

Gen[Syntax.FunctionDeclaration] =
function generateFunctionDeclaration(g, stmt) {
    var isGenerator = !!stmt.generator;

    g.emit(isGenerator ? ('function*' + optSpace) : ('function' + space ));
    g.emit(stmt.id.name);
    generateFunctionBody(g, stmt);
};

Gen[Syntax.ReturnStatement] =
function generateReturnStatement(g, stmt, opt) {
    if (stmt.argument) {
        var arg = g.generate(generateExpression, stmt.argument, GenOpts.returnStmtArg);

        g.emit(sourceJoin('return', arg) + opt.semicolon);
    }

    else
        g.emit('return' + opt.semicolon);
};

Gen[Syntax.WhileStatement] =
function generateWhileStatement(g, stmt, opt) {
    var prevIndent = shiftIndent();

    g.emit('while' + optSpace + '(');
    g.expand(generateExpression, stmt.test, GenOpts.whileStmtTest);
    g.emit(')');
    indent = prevIndent;

    g.emit(adoptionPrefix(stmt.body));
    g.expand(generateStatement, stmt.body, GenOpts.whileStmtBody(opt.semicolon === ''));
};

Gen[Syntax.WithStatement] =
function generateWithStatement(g, stmt, opt) {
    var prevIndent = shiftIndent();

    g.emit('with' + optSpace + '(');
    g.expand(generateExpression, stmt.object, GenOpts.withStmtObj);
    g.emit(')');
    indent = prevIndent;

    g.emit(adoptionPrefix(stmt.body));
    g.expand(generateStatement, stmt.body, GenOpts.withStmtBody(opt.semicolon === ''));

};

function generateStatement(g, stmt, option) {
    var result,
        allowIn,
        functionBody,
        directiveContext,
        semicolon;

    allowIn = true;
    semicolon = ';';
    functionBody = false;
    directiveContext = false;

    if (option) {
        allowIn = option.allowIn === void 0 || option.allowIn;
        if (!semicolons && option.semicolonOptional === true) {
            semicolon = '';
        }
        functionBody = option.functionBody;
        directiveContext = option.directiveContext;
    }

    var gen = Gen[stmt.type];

    //TODO fake gen for now
    var fakeGen = {
        emit: function (generated) {
            result = result || '';
            result += generated;
        },
        expand: function (proc, node, opt) {
            var rr = proc(g, node, opt);

            if (rr !== void 0) {
                result = result || '';
                result += rr;
            }
        },
        generate: CodeGen.generate
    };

    if (gen) {
        var rr = gen(fakeGen, stmt, {
            allowIn: allowIn,
            semicolon: semicolon,
            functionBody: functionBody,
            directiveContext: directiveContext
        });

        if (rr !== void 0)
            result = rr;
    }
    else {
        fatalError('Unknown statement type: ' + stmt.type);
    }

    return toSource(result);
}

function generateInternal(g, node, opt) {
    if (isStatement(node))
        return generateStatement(g, node, opt);

    else if (isExpression(node))
        return generateExpression(g, node, {
            precedence: Precedence.Sequence,
            allowIn: true,
            allowCall: true
        });

    else
        fatalError('Unknown node type: ' + node.type);
}

//CodeGen
//-----------------------------------------------------------------------------------
var CodeGen = function () {
    this.nextPass = [];
    this.pass = null;
    this.out = [];
    this.idx = -1;
    this.offset = 0;
};

CodeGen.generate = CodeGen.prototype.generate = function (proc, node, opt, indent) {
    var g = new CodeGen();

    g.expand(proc, node, opt, indent);

    return g.traverse();
};

CodeGen.prototype.emit = function (generated) {
    this.idx++;
    this.offset++;
    this.out.splice(this.idx, 0, generated);
};

CodeGen.prototype.expand = function (proc, node, opt) {
    this.nextPass.push({
        proc: proc,
        node: node,
        opt: opt,
        insertionIdx: this.idx
    });
};

CodeGen.prototype.traverse = function () {
    while (this.nextPass.length) {
        this.pass = this.nextPass;
        this.nextPass = [];
        this.offset = 0;

        for (var i = 0; i < this.pass.length; i++) {
            var task = this.pass[i];

            this.idx = task.insertionIdx + this.offset;
            var r = task.proc(this, task.node, task.opt);

            //TODO
            if (r !== void 0)
                this.emit(r);
        }
    }

    return toSource(this.out);
};

function generate(node, options) {
    var defaultOptions = getDefaultOptions(), result, pair;

    if (options != null) {
        // Obsolete options
        //
        //   `options.indent`
        //   `options.base`
        //
        // Instead of them, we can use `option.format.indent`.
        if (typeof options.indent === 'string') {
            defaultOptions.format.indent.style = options.indent;
        }
        if (typeof options.base === 'number') {
            defaultOptions.format.indent.base = options.base;
        }
        options = updateDeeply(defaultOptions, options);
        indentUnit = options.format.indent.style;
        if (typeof options.base === 'string') {
            indent = options.base;
        } else {
            indent = stringRepeat(indentUnit, options.format.indent.base);
        }
    } else {
        options = defaultOptions;
        indentUnit = options.format.indent.style;
        indent = stringRepeat(indentUnit, options.format.indent.base);
    }
    json = options.format.json;
    renumber = options.format.renumber;
    hexadecimal = json ? false : options.format.hexadecimal;
    quotes = json ? 'double' : options.format.quotes;
    escapeless = options.format.escapeless;
    newline = options.format.newline;
    optSpace = options.format.space;
    if (options.format.compact) {
        newline = optSpace = indentUnit = indent = '';
    }
    parentheses = options.format.parentheses;
    semicolons = options.format.semicolons;
    safeConcatenation = options.format.safeConcatenation;
    directive = options.directive;
    parse = json ? null : options.parse;
    extra = options;
    space = optSpace ? optSpace : ' ';

    return CodeGen.generate(generateInternal, node);
}

FORMAT_MINIFY = {
    indent: {
        style: '',
        base: 0
    },
    renumber: true,
    hexadecimal: true,
    quotes: 'auto',
    escapeless: true,
    compact: true,
    parentheses: false,
    semicolons: false
};

FORMAT_DEFAULTS = getDefaultOptions().format;

//TODO
/*var stats = {};

 Object.keys(_).forEach(function (key) {
 var fn = _[key];

 _[key] = function () {
 if (!stats[key])
 stats[key] = 0;

 stats[key]++;
 return fn.apply(null, arguments);
 };

 });

 exports.printStats = function () {
 Object.keys(stats)
 .map(function (key) {
 return [key, stats[key]]
 })
 .sort(function (a, b) {
 return a[1] - b[1];
 })
 .forEach(function (item) {
 console.log(item[0] + ' - ' + item[1]);
 });
 };*/

exports.version = require('./package.json').version;
exports.generate = generate;
exports.Precedence = updateDeeply({}, Precedence);
exports.browser = false;
exports.FORMAT_MINIFY = FORMAT_MINIFY;
exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
