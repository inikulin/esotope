/*
 Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
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


function joinWithSpacing(left, right) {
    if (!left.length)
        return right;

    if (!right.length)
        return left;

    var leftCp = left.charCodeAt(left.length - 1),
        rightCp = right.charCodeAt(0);

    if ((leftCp === 0x2B  /* + */ || leftCp === 0x2D  /* - */) && leftCp === rightCp ||
        esutils.code.isIdentifierPart(leftCp) && esutils.code.isIdentifierPart(rightCp) ||
        leftCp === 0x2F  /* / */ && rightCp === 0x69  /* i */) { // infix word operators all start with `i`
        return left + space + right;
    }

    else if (esutils.code.isWhiteSpace(leftCp) || esutils.code.isLineTerminator(leftCp) ||
             esutils.code.isWhiteSpace(rightCp) || esutils.code.isLineTerminator(rightCp)) {
        return left + right;
    }
    return left + optSpace + right;
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
        _.js += '(';

    _.js += chunks[0];

    for (var i = 1; i < chunkCount; i++)
        _.js += newline + indent + chunks[i];

    if (parenthesize)
        _.js += ')';
}

function generateFunctionParams(g, node) {
    var params = node.params,
        paramCount = node.params.length,
        lastParamIdx = paramCount - 1,
        defaults = node.defaults,
        hasDefaults = !!defaults;


    // arg => { } case
    if (node.type === Syntax.ArrowFunctionExpression && !node.rest && (!hasDefaults || defaults.length === 0) &&
        paramCount === 1 && params[0].type === Syntax.Identifier) {
        _.js += params[0].name;
    }

    else {
        _.js += '(';

        for (var i = 0; i < paramCount; ++i) {
            if (hasDefaults && defaults[i]) {
                var fakeAssignExpr = {
                    type: Syntax.AssignmentExpression,
                    left: params[i],
                    right: node.defaults[i],
                    operator: '='
                };

                g.expand(generateExpression, fakeAssignExpr, GenOpts.funcArg);
            }

            else {
                if (params[i].type === Syntax.Identifier)
                    _.js += params[i].name;

                else
                    g.expand(generateExpression, params[i], GenOpts.funcArg);
            }

            if (i !== lastParamIdx)
                _.js += ',' + optSpace;
        }

        if (node.rest) {
            if (paramCount)
                _.js += ',' + optSpace;

            _.js += '...' + node.rest.name;
        }

        _.js += ')';
    }
}

function generateFunctionBody(g, node) {
    generateFunctionParams(g, node);

    if (node.type === Syntax.ArrowFunctionExpression)
        _.js += optSpace + '=>';

    if (node.expression) {
        _.js += optSpace;

        var expr = g.generate(generateExpression, node.body, GenOpts.funcBodyExpr);

        if (expr.charAt(0) === '{')
            expr = '(' + expr + ')';

        _.js += expr;
    }

    else {
        _.js += adoptionPrefix(node.body);
        g.expand(generateStatement, node.body, GenOpts.funcBodyStmt);
    }
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


//-------------------------------------------------===------------------------------------------------------
//                                Syntactic entities generation options
//-------------------------------------------------===------------------------------------------------------

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
    },

    funcArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true
    }
};


//-------------------------------------------------===-------------------------------------------------------
//                                             Expressions
//-------------------------------------------------===-------------------------------------------------------

/**
 * Regular expressions
 */
var FLOATING_OR_OCTAL_REGEXP = /[.eExX]|^0[0-9]+|/,
    LAST_DECIMAL_DIGIT_REGEXP = /[0-9]$/;


/**
 *  Common expression generators
 */
function generateLogicalOrBinaryExpression(g, expr, opt) {
    var op = expr.operator,
        precedence = BinaryPrecedence[expr.operator],
        parenthesize = precedence < opt.precedence,
        allowIn = opt.allowIn || parenthesize,
        operandGenOpt = GenOpts.binExprOperand(precedence, allowIn),
        js = g.generate(generateExpression, expr.left, operandGenOpt);

    parenthesize |= op === 'in' && !allowIn;

    if (parenthesize)
        _.js += '(';

    if (js.charCodeAt(js.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(op.charCodeAt(0)))
        js = js + space + op;

    else
        js = joinWithSpacing(js, op);

    operandGenOpt.precedence++;

    var right = g.generate(generateExpression, expr.right, operandGenOpt);

    // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
    if (op === '/' && right.charAt(0) === '/' || op.slice(-1) === '<' && right.slice(0, 3) === '!--')
        js += space + right;

    else
        js = joinWithSpacing(js, right);

    _.js += js;

    if (parenthesize)
        _.js += ')';
}

function generateArrayPatternOrExpression(g, expr) {
    var elemCount = expr.elements.length;

    if (elemCount) {
        var lastElemIdx = elemCount - 1,
            multiline = elemCount > 1,
            prevIndent = shiftIndent(),
            itemPrefix = newline + indent;

        _.js += '[';

        for (var i = 0; i < elemCount; i++) {
            if (multiline)
                _.js += itemPrefix;

            if (expr.elements[i])
                g.expand(generateExpression, expr.elements[i], GenOpts.arrayExprElement);

            if (i !== lastElemIdx || !expr.elements[i])
                _.js += ',';
        }

        indent = prevIndent;

        if (multiline)
            _.js += newline + indent;

        _.js += ']';
    }

    else
        _.js += '[]';
}

function generateImportOrExportSpecifier(g, expr) {
    _.js += expr.id.name;

    if (expr.name)
        _.js += space + 'as' + space + expr.name.name;
}

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

            js = i > 0 ? joinWithSpacing(js, block) : (js + block);
        }

        indent = prevIndent;
    }

    if (expr.filter) {
        var filter = g.generate(generateExpression, expr.filter, GenOpts.genExprFilter);
        js = joinWithSpacing(js, 'if' + optSpace);
        js = joinWithSpacing(js, '(' + filter + ')');
    }

    js = joinWithSpacing(js, body);
    js += isGenerator ? ')' : ']';

    _.js += js;
}


/**
 * Expression generator dictionary
 */
var ExprGen = {
    SequenceExpression: function generateSequenceExpression(g, expr, opt) {
        var len = expr.expressions.length,
            lastIdx = len - 1,
            parenthesize = Precedence.Sequence < opt.precedence,
            expandOpt = GenOpts.sequenceExprChildren(opt.allowIn || parenthesize);

        if (parenthesize)
            _.js += '(';

        for (var i = 0; i < len; i++) {
            g.expand(generateExpression, expr.expressions[i], expandOpt);

            if (i !== lastIdx)
                _.js += ',' + optSpace;
        }

        if (parenthesize)
            _.js += ')';
    },

    AssignmentExpression: function generateAssignmentExpression(g, expr, opt) {
        var parenthesize = Precedence.Assignment < opt.precedence,
            allowIn = opt.allowIn || parenthesize;

        if (parenthesize)
            _.js += '(';

        g.expand(generateExpression, expr.left, GenOpts.assignExprLeftOperand(allowIn));
        _.js += optSpace + expr.operator + optSpace;
        g.expand(generateExpression, expr.right, GenOpts.assignExprRightOperand(allowIn));

        if (parenthesize)
            _.js += ')';
    },

    ArrowFunctionExpression: function generateArrowFunctionExpression(g, expr, opt) {
        var parenthesize = Precedence.ArrowFunction < opt.precedence;

        if (parenthesize)
            _.js += '(';

        generateFunctionBody(g, expr);

        if (parenthesize)
            _.js += ')';
    },

    ConditionalExpression: function generateConditionalExpression(g, expr, opt) {
        var parenthesize = Precedence.Conditional < opt.precedence,
            allowIn = opt.allowIn || parenthesize,
            testExpandOpt = GenOpts.conditionalExprTest(allowIn),
            branchExpandOpt = GenOpts.conditionalExprBranch(allowIn);

        if (parenthesize)
            _.js += '(';

        g.expand(generateExpression, expr.test, testExpandOpt);
        _.js += optSpace + '?' + optSpace;
        g.expand(generateExpression, expr.consequent, branchExpandOpt);
        _.js += optSpace + ':' + optSpace;
        g.expand(generateExpression, expr.alternate, branchExpandOpt);

        if (parenthesize)
            _.js += ')';
    },

    LogicalExpression: generateLogicalOrBinaryExpression,
    BinaryExpression: generateLogicalOrBinaryExpression,

    CallExpression: function generateCallExpression(g, expr, opt) {
        var argCount = expr['arguments'].length,
            lastArgIdx = argCount - 1,
            parenthesize = !opt.allowCall || Precedence.Call < opt.precedence;

        if (parenthesize)
            _.js += '(';

        g.expand(generateExpression, expr.callee, GenOpts.callExprCallee);
        _.js += '(';

        for (var i = 0; i < argCount; ++i) {
            g.expand(generateExpression, expr['arguments'][i], GenOpts.callExprArgs);

            if (i !== lastArgIdx)
                _.js += ',' + optSpace;
        }

        _.js += ')';

        if (parenthesize)
            _.js += ')';
    },

    NewExpression: function generateNewExpression(g, expr, opt) {
        var parenthesize = Precedence.New < opt.precedence,
            argCount = expr['arguments'].length,
            lastArgIdx = argCount - 1,
            allowUnparenthesizedNew = opt.allowUnparenthesizedNew === void 0 || opt.allowUnparenthesizedNew,
            withCall = !allowUnparenthesizedNew || parentheses || argCount > 0,
            callee = g.generate(generateExpression, expr.callee, GenOpts.newExprCallee(!withCall));

        if (parenthesize)
            _.js += '(';

        _.js += joinWithSpacing('new', callee);

        if (withCall) {
            _.js += '(';

            for (var i = 0; i < argCount; ++i) {
                g.expand(generateExpression, expr['arguments'][i], GenOpts.newExprArg);

                if (i !== lastArgIdx)
                    _.js += ',' + optSpace;
            }

            _.js += ')';
        }

        if (parenthesize)
            _.js += ')';
    },

    MemberExpression: function generateMemberExpression(g, expr, opt) {
        var parenthesize = Precedence.Member < opt.precedence;

        if (parenthesize)
            _.js += '(';

        if (!expr.computed && expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
            var num = g.generate(generateExpression, expr.object, GenOpts.memberExprObj(opt.allowCall));

            // When the following conditions are all true:
            //   1. No floating point
            //   2. Don't have exponents
            //   3. The last character is a decimal digit
            //   4. Not hexadecimal OR octal number literal
            // we should add a floating point.
            var withPoint = LAST_DECIMAL_DIGIT_REGEXP.test(num) && !FLOATING_OR_OCTAL_REGEXP.test(num);

            _.js += withPoint ? (num + '.') : num;
        }

        else
            g.expand(generateExpression, expr.object, GenOpts.memberExprObj(opt.allowCall));

        if (expr.computed) {
            _.js += '[';
            g.expand(generateExpression, expr.property, GenOpts.memberExprProp(opt.allowCall));
            _.js += ']';
        }

        else
            _.js += '.' + expr.property.name;

        if (parenthesize)
            _.js += ')';
    },

    UnaryExpression: function generateUnaryExpression(g, expr, opt) {
        var parenthesize = Precedence.Unary < opt.precedence,
            op = expr.operator,
            arg = g.generate(generateExpression, expr.argument, GenOpts.unaryExprArg);

        if (parenthesize)
            _.js += '(';

        // delete, void, typeof
        // get `typeof []`, not `typeof[]`
        if (optSpace === '' || op.length > 2)
            _.js += joinWithSpacing(op, arg);

        else {
            _.js += op;

            // Prevent inserting spaces between operator and argument if it is unnecessary
            // like, `!cond`
            var left = op.charCodeAt(op.length - 1),
                right = arg.charCodeAt(0);

            if (((left === 0x2B  /* + */ || left === 0x2D  /* - */) && left === right) ||
                (esutils.code.isIdentifierPart(left) && esutils.code.isIdentifierPart(right))) {
                _.js += space;
            }

            _.js += arg;
        }

        if (parenthesize)
            _.js += ')';
    },

    YieldExpression: function generateYieldExpression(g, expr, opt) {
        var js = expr.delegate ? 'yield*' : 'yield',
            parenthesize = Precedence.Yield < opt.precedence;

        if (parenthesize)
            _.js += '(';

        if (expr.argument) {
            var arg = g.generate(generateExpression, expr.argument, GenOpts.yieldExprArg);

            js = joinWithSpacing(js, arg);
        }

        _.js += js;

        if (parenthesize)
            _.js += ')';
    },

    UpdateExpression: function generateUpdateExpression(g, expr, opt) {
        var precedence = expr.prefix ? Precedence.Unary : Precedence.Postfix,
            parenthesize = precedence < opt.precedence;

        if (parenthesize)
            _.js += '(';

        if (expr.prefix) {
            _.js += expr.operator;
            g.expand(generateExpression, expr.argument, GenOpts.prefixUpdateExprArg);
        }

        else {
            g.expand(generateExpression, expr.argument, GenOpts.postfixUpdateExprArg);
            _.js += expr.operator;
        }

        if (parenthesize)
            _.js += ')';
    },

    FunctionExpression: function generateFunctionExpression(g, expr) {
        var isGenerator = !!expr.generator;

        _.js += isGenerator ? 'function*' : 'function';

        if (expr.id) {
            _.js += isGenerator ? optSpace : space;
            _.js += expr.id.name;
        }
        else
            _.js += optSpace;

        generateFunctionBody(g, expr);
    },

    ExportBatchSpecifier: function generateExportBatchSpecifier(g) {
        _.js += '*';
    },

    ArrayPattern: generateArrayPatternOrExpression,
    ArrayExpression: generateArrayPatternOrExpression,

    ClassExpression: function generateClassExpression(g, expr) {
        var js = 'class';

        if (expr.id) {
            var id = g.generate(generateExpression, expr.id, GenOpts.classExprId);

            js = joinWithSpacing(js, id);
        }

        if (expr.superClass) {
            var superClass = g.generate(generateExpression, expr.superClass, GenOpts.classDeclarationSuperClass);

            superClass = joinWithSpacing('extends', superClass);
            js = joinWithSpacing(js, superClass);
        }

        _.js += js + optSpace;
        g.expand(generateStatement, expr.body, GenOpts.classExprBody);
    },

    MethodDefinition: function generateMethodDefinition(g, expr) {
        var js = expr['static'] ? 'static' + optSpace : '',
            propKey = g.generate(generateExpression, expr.key, expr.computed, GenOpts.propKey);

        if (expr.computed)
            propKey = '[' + propKey + ']';

        var body = g.generate(generateFunctionBody, expr.value),
            propKeyWithBody = propKey + body;

        if (expr.kind === 'get' || expr.kind === 'set') {
            propKeyWithBody = joinWithSpacing(expr.kind, propKeyWithBody);
            js = joinWithSpacing(js, propKeyWithBody);
        }

        else {
            if (expr.value.generator)
                js += '*' + propKeyWithBody;

            else
                js = joinWithSpacing(js, propKeyWithBody);
        }

        _.js += js;
    },

    Property: function generateProperty(g, expr) {
        var propKey = g.generate(generateExpression, expr.key, GenOpts.propKey);

        if (expr.computed)
            propKey = '[' + propKey + ']';

        if (expr.kind === 'get' || expr.kind === 'set') {
            _.js += expr.kind + space + propKey;
            generateFunctionBody(g, expr.value);
        }

        else {
            if (expr.shorthand)
                _.js += propKey;

            else if (expr.method) {
                _.js += expr.value.generator ? ('*' + propKey) : propKey;
                generateFunctionBody(g, expr.value)
            }

            else {
                _.js += propKey + ':' + optSpace;
                g.expand(generateExpression, expr.value, GenOpts.propVal);
            }
        }
    },

    ObjectExpression: function generateObjectExpression(g, expr) {
        var propCount = expr.properties.length;

        if (propCount) {
            var lastPropIdx = propCount - 1,
                prevIndent = shiftIndent();

            _.js += '{';

            for (var i = 0; i < propCount; i++) {
                _.js += newline + indent;
                g.expand(generateExpression, expr.properties[i], GenOpts.objExprProperty);

                if (i !== lastPropIdx)
                    _.js += ',';
            }

            indent = prevIndent;
            _.js += newline + indent + '}';
        }

        else
            _.js += '{}';
    },

    ObjectPattern: function generateObjectPattern(g, expr) {
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

            _.js += multiline ? ('{' + newline) : '{';

            var prevIndent = shiftIndent(),
                propSuffix = ',' + (multiline ? newline : optSpace);

            for (var i = 0; i < propCount; i++) {
                if (multiline)
                    _.js += indent;

                g.expand(generateExpression, expr.properties[i], GenOpts.objPatternProp);

                if (i !== lastPropIdx)
                    _.js += propSuffix;
            }

            indent = prevIndent;
            _.js += multiline ? (newline + indent + '}') : '}';
        }
        else
            _.js += '{}';
    },

    ThisExpression: function generateThisExpression(g) {
        _.js += 'this';
    },

    Identifier: function generateIdentifier(g, node) {
        _.js += node.name;
    },

    ImportSpecifier: generateImportOrExportSpecifier,
    ExportSpecifier: generateImportOrExportSpecifier,

    Literal: function (g, expr) {
        _.js += generateLiteral(g, expr);
    },

    GeneratorExpression: generateGeneratorOrComprehensionExpression,
    ComprehensionExpression: generateGeneratorOrComprehensionExpression,

    ComprehensionBlock: function generateComprehensionBlock(g, expr) {
        var left = void 0,
            right = g.generate(generateExpression, expr.right, GenOpts.comprBlockRightExpr);

        if (expr.left.type === Syntax.VariableDeclaration) {
            left = expr.left.kind +
                   space +
                   g.generate(generateStatement, expr.left.declarations[0], GenOpts.comprBlockVarDeclaration);
        }

        else
            left = g.generate(generateExpression, expr.left, GenOpts.comprBlockLeftExpr);

        left = joinWithSpacing(left, expr.of ? 'of' : 'in');

        _.js += 'for' + optSpace + '(' + joinWithSpacing(left, right) + ')';
    },

    SpreadElement: function generateSpreadElement(g, expr) {
        _.js += '...';
        g.expand(generateExpression, expr.argument, GenOpts.spreadElementArg);
    },

    TaggedTemplateExpression: function generateTaggedTemplateExpression(g, expr, opt) {
        var parenthesize = Precedence.TaggedTemplate < opt.precedence;

        if (parenthesize)
            _.js += '(';

        g.expand(generateExpression, expr.tag, GenOpts.taggedTemplateExprTag(opt.allowCall));
        g.expand(generateExpression, expr.quasi, GenOpts.taggedTemplateExprQuasi);

        if (parenthesize)
            _.js += ')';
    },

    TemplateElement: function generateTemplateElement(g, expr) {
        // Don't use "cooked". Since tagged template can use raw template
        // representation. So if we do so, it breaks the script semantics.
        _.js += expr.value.raw;
    },

    TemplateLiteral: function generateTemplateLiteral(g, expr) {
        var quasiCount = expr.quasis.length,
            lastQuasiIdx = quasiCount - 1;

        _.js += '`';

        for (var i = 0; i < quasiCount; ++i) {
            g.expand(generateExpression, expr.quasis[i], GenOpts.templateLiteralQuasi);

            if (i !== lastQuasiIdx) {
                _.js += '${' + optSpace;
                g.expand(generateExpression, expr.expressions[i], GenOpts.templateLiteralExpr);
                _.js += optSpace + '}';
            }
        }

        _.js += '`';
    }
};

function generateExpression(g, expr, option) {
    var precedence = option.precedence,
        allowIn = option.allowIn,
        allowCall = option.allowCall,
        type = expr.type || option.type;


    if (extra.verbatim && expr.hasOwnProperty(extra.verbatim))
        g.expand(generateVerbatim, expr, option);

    else {
        ExprGen[type](g, expr, {
            precedence: precedence,
            allowIn: allowIn,
            allowCall: allowCall,
            type: type,
            allowUnparenthesizedNew: option.allowUnparenthesizedNew
        });
    }
}

//-------------------------------------------------===------------------------------------------------------
//                                              Statements
//-------------------------------------------------===------------------------------------------------------


/**
 * Regular expressions
 */
var EXPRESSION_STATEMENT_UNALLOWED_EXPR_REGEX = /^{|^class(?:\s|{)|^function(?:\s|\*|\()/;


/**
 * Common statement generators
 */

function generateTryStatementHandlers(g, js, finalizer, handlers) {
    var handlerCount = handlers.length,
        lastHandlerIdx = handlerCount - 1;

    for (var i = 0; i < handlerCount; ++i) {
        var handler = g.generate(generateStatement, handlers[i], GenOpts.tryStmtHandler);

        js = joinWithSpacing(js, handler);

        if (finalizer || i !== lastHandlerIdx)
            js += adoptionSuffix(handlers[i].body);
    }

    return js;
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

    js = joinWithSpacing(js, operator);

    var right = g.generate(generateExpression, stmt.right, GenOpts.forStmtIterRight);

    js = joinWithSpacing(js, right) + ')';

    indent = prevIndent1;

    _.js += js + adoptionPrefix(stmt.body);
    g.expand(generateStatement, stmt.body, GenOpts.forStmtIterBody(opt.semicolon === ''));
}

/**
 * Statement generator dictionary
 */
var StmtGen = {
    BlockStatement: function generateBlockStatement(g, stmt, opt) {
        var len = stmt.body.length,
            lastIdx = len - 1,
            prevIndent = shiftIndent();

        _.js += '{' + newline;

        for (var i = 0; i < len; i++) {
            _.js += indent;
            g.expand(generateStatement, stmt.body[i], GenOpts.blockStmtBodyItem(opt.functionBody, i === lastIdx));
            _.js += newline;
        }

        indent = prevIndent;
        _.js += indent + '}';
    },

    BreakStatement: function generateBreakStatement(g, stmt, opt) {
        if (stmt.label)
            _.js += 'break ' + stmt.label.name + opt.semicolon;

        else
            _.js += 'break' + opt.semicolon;
    },

    ContinueStatement: function generateContinueStatement(g, stmt, opt) {
        if (stmt.label)
            _.js += 'continue ' + stmt.label.name + opt.semicolon;

        else
            _.js += 'continue' + opt.semicolon;
    },

    ClassBody: function generateClassBody(g, classBody) {
        var len = classBody.body.length,
            lastIdx = len - 1,
            prevIndent = shiftIndent();

        _.js += '{' + newline;

        for (var i = 0; i < len; i++) {
            _.js += indent;
            g.expand(generateExpression, classBody.body[i], GenOpts.classBodyItem);

            if (i !== lastIdx)
                _.js += newline;
        }

        indent = prevIndent;
        _.js += newline + indent + '}';
    },

    ClassDeclaration: function generateClassDeclaration(g, stmt) {
        var js = 'class ' + stmt.id.name;

        if (stmt.superClass) {
            var fragment = g.generate(generateExpression, stmt.superClass, GenOpts.classDeclarationSuperClass);

            js += space + joinWithSpacing('extends', fragment);
        }

        _.js += js + optSpace;
        g.expand(generateStatement, stmt.body, GenOpts.classDeclarationBody);
    },

    DirectiveStatement: function generateDirectiveStatement(g, stmt, opt) {
        if (extra.raw && stmt.raw)
            _.js += stmt.raw + opt.semicolon;

        else
            _.js += escapeDirective(stmt.directive) + opt.semicolon;
    },

    DoWhileStatement: function generateDoWhileStatement(g, stmt, opt) {
        var body = adoptionPrefix(stmt.body) +
                   g.generate(generateStatement, stmt.body, GenOpts.doWhileStmtBody) +
                   adoptionSuffix(stmt.body);

        //NOTE: Because `do 42 while (cond)` is Syntax Error. We need semicolon.
        var js = joinWithSpacing('do', body);
        js = joinWithSpacing(js, 'while' + optSpace + '(');

        _.js += js;
        g.expand(generateExpression, stmt.test, GenOpts.doWhileStmtTest);
        _.js += ')' + opt.semicolon;
    },

    CatchClause: function generateCatchClause(g, stmt) {
        var prevIndent = shiftIndent();

        _.js += 'catch' + optSpace + '(';
        g.expand(generateExpression, stmt.param, GenOpts.catchClauseParam);

        if (stmt.guard) {
            _.js += ' if ';
            g.expand(generateExpression, stmt.guard, GenOpts.catchClauseGuard);
        }

        indent = prevIndent;
        _.js += ')' + adoptionPrefix(stmt.body);
        g.expand(generateStatement, stmt.body, GenOpts.catchClauseBody);
    },

    DebuggerStatement: function generateDebuggerStatement(g, stmt, opt) {
        _.js += 'debugger' + opt.semicolon;
    },

    EmptyStatement: function generateEmptyStatement(g) {
        _.js += ';';
    },

    ExportDeclaration: function generateExportDeclaration(g, stmt, opt) {
        // export default AssignmentExpression[In] ;
        if (stmt['default']) {
            var decl = g.generate(generateExpression, stmt.declaration, GenOpts.exportDeclDefaultDecl);

            _.js += joinWithSpacing('export default', decl) + opt.semicolon;
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

                js = joinWithSpacing(js, spec);
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
                js = joinWithSpacing(js, 'from' + optSpace + generateLiteral(g, stmt.source));

            _.js += js + opt.semicolon;

        }

        // export VariableStatement
        // export Declaration[Default]
        else if (stmt.declaration) {
            var decl = g.generate(generateStatement, stmt.declaration, GenOpts.exportDeclDecl(opt.semicolon === ''));

            _.js += joinWithSpacing('export', decl);
        }
    },

    ExpressionStatement: function generateExpressionStatement(g, stmt, opt) {
        var exprSource = g.generate(generateExpression, stmt.expression, GenOpts.exprStmtExpr),
            parenthesize = EXPRESSION_STATEMENT_UNALLOWED_EXPR_REGEX.test(exprSource) ||
                           (directive &&
                            opt.directiveContext &&
                            stmt.expression.type === Syntax.Literal &&
                            typeof stmt.expression.value === 'string');

        // '{', 'function', 'class' are not allowed in expression statement.
        // Therefore, they should be parenthesized.
        if (parenthesize)
            _.js += '(' + exprSource + ')' + opt.semicolon;

        else
            _.js += exprSource + opt.semicolon;
    },

    ImportDeclaration: function generateImportDeclaration(g, stmt, opt) {
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
                js = joinWithSpacing(js, stmt.specifiers[0].id.name);

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

            js = joinWithSpacing(js, 'from')
        }

        js += optSpace + generateLiteral(g, stmt.source) + opt.semicolon;

        _.js += js;
    },

    VariableDeclarator: function generateVariableDeclarator(g, stmt, opt) {
        var genOpt = GenOpts.varDeclaratorInit(opt.allowIn);

        if (stmt.init) {
            g.expand(generateExpression, stmt.id, genOpt);
            _.js += optSpace + '=' + optSpace;
            g.expand(generateExpression, stmt.init, genOpt);
        }

        else {
            if (stmt.id.type === Syntax.Identifier)
                _.js += stmt.id.name;

            else
                g.expand(generateExpression, stmt.id, genOpt);
        }
    },

    VariableDeclaration: function generateVariableDeclaration(g, stmt, opt) {
        var len = stmt.declarations.length,
            prevIndent = len > 1 ? shiftIndent() : indent,
            expandOpt = GenOpts.varDeclaration(opt.allowIn);

        _.js += stmt.kind;

        for (var i = 0; i < len; i++) {
            _.js += i === 0 ? space : (',' + optSpace);
            g.expand(generateStatement, stmt.declarations[i], expandOpt);
        }

        _.js += opt.semicolon;
        indent = prevIndent;
    },

    ThrowStatement: function generateThrowStatement(g, stmt, opt) {
        var arg = g.generate(generateExpression, stmt.argument, GenOpts.throwStmtArg);

        _.js += joinWithSpacing('throw', arg) + opt.semicolon;
    },

    TryStatement: function generateTryStatement(g, stmt) {
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
            js = joinWithSpacing(js, 'finally' + adoptionPrefix(stmt.finalizer));
            js += g.generate(generateStatement, stmt.finalizer, GenOpts.tryStmtFinalizer);
        }

        _.js += js;
    },

    SwitchStatement: function generateSwitchStatement(g, stmt) {
        var prevIndent = shiftIndent();

        _.js += 'switch' + optSpace + '(';
        g.expand(generateExpression, stmt.discriminant, GenOpts.switchStmtDiscriminant);
        _.js += ')' + optSpace + '{' + newline;
        indent = prevIndent;

        if (stmt.cases) {
            var len = stmt.cases.length,
                lastIdx = len - 1;

            for (var i = 0; i < len; i++) {
                _.js += indent;
                g.expand(generateStatement, stmt.cases[i], GenOpts.switchStmtCase(i === lastIdx));
                _.js += newline;
            }
        }

        _.js += indent + '}';
    },

    SwitchCase: function generateSwitchCase(g, stmt, opt) {
        var i = 0,
            prevIndent = shiftIndent(),
            conseqCount = stmt.consequent.length,
            lastConseqIdx = conseqCount - 1;

        if (stmt.test) {
            var test = g.generate(generateExpression, stmt.test, GenOpts.switchCaseTest);
            _.js += joinWithSpacing('case', test) + ':';
        }

        else
            _.js += 'default:';


        if (conseqCount && stmt.consequent[0].type === Syntax.BlockStatement) {
            i++;
            _.js += adoptionPrefix(stmt.consequent[0]);
            g.expand(generateStatement, stmt.consequent[0], GenOpts.switchCaseConseqBlock);
        }

        for (; i < conseqCount; i++) {
            _.js += newline + indent;
            g.expand(generateStatement, stmt.consequent[i], GenOpts.switchCaseConseq(i === lastConseqIdx &&
                                                                                     opt.semicolon === ''));
        }

        indent = prevIndent;
    },

    IfStatement: function generateIfStatement(g, stmt, opt) {
        var prevIndent = shiftIndent(),
            semicolonOptional = opt.semicolon === '';

        _.js += 'if' + optSpace + '(';
        g.expand(generateExpression, stmt.test, GenOpts.ifStmtTest);
        _.js += ')';
        indent = prevIndent;
        _.js += adoptionPrefix(stmt.consequent);

        if (stmt.alternate) {
            var conseq = g.generate(generateStatement, stmt.consequent, GenOpts.ifStmtConseqWithAlt) +
                         adoptionSuffix(stmt.consequent),
                alt = g.generate(generateStatement, stmt.alternate, GenOpts.ifStmtAlt(semicolonOptional));

            if (stmt.alternate.type === Syntax.IfStatement)
                alt = 'else ' + alt;

            else
                alt = joinWithSpacing('else', adoptionPrefix(stmt.alternate) + alt);

            _.js += joinWithSpacing(conseq, alt);
        }

        else
            g.expand(generateStatement, stmt.consequent, GenOpts.ifStmtConseq(semicolonOptional))
    },

    ForStatement: function generateForStatement(g, stmt, opt) {
        var prevIndent = shiftIndent();

        _.js += 'for' + optSpace + '(';

        if (stmt.init) {
            if (stmt.init.type === Syntax.VariableDeclaration)
                g.expand(generateStatement, stmt.init, GenOpts.forStmtVarInit);

            else {
                g.expand(generateExpression, stmt.init, GenOpts.forStmtInit);
                _.js += ';';
            }
        }

        else
            _.js += ';';

        if (stmt.test) {
            _.js += optSpace;
            g.expand(generateExpression, stmt.test, GenOpts.forStmtTest);
        }

        _.js += ';';

        if (stmt.update) {
            _.js += optSpace;
            g.expand(generateExpression, stmt.update, GenOpts.forStmtUpdate);
        }

        _.js += ')';

        indent = prevIndent;

        _.js += adoptionPrefix(stmt.body);
        g.expand(generateStatement, stmt.body, GenOpts.forStmtBody(opt.semicolon === ''));
    },

    ForInStatement: function generateForInStatement(g, stmt, opt) {
        generateForStatementIterator(g, 'in', stmt, opt);
    },

    ForOfStatement: function generateForOfStatement(g, stmt, opt) {
        generateForStatementIterator(g, 'of', stmt, opt);
    },

    LabeledStatement: function generateLabeledStatement(g, stmt, opt) {
        var prevIndent = indent;

        _.js += stmt.label.name + ':' + adoptionPrefix(stmt.body);

        if (stmt.body.type !== Syntax.BlockStatement)
            prevIndent = shiftIndent();

        g.expand(generateStatement, stmt.body, GenOpts.labeledStmtBody(opt.semicolon === ''));
        indent = prevIndent;
    },

    ModuleDeclaration: function generateModuleDeclaration(g, stmt, opt) {
        _.js += 'module' + space + stmt.id.name + space +
                'from' + optSpace + generateLiteral(g, stmt.source) + opt.semicolon;
    },

    Program: function generateProgram(g, stmt) {
        var len = stmt.body.length,
            lastIdx = len - 1;

        if (safeConcatenation && len > 0)
            _.js += '\n';

        for (var i = 0; i < len; i++) {
            _.js += indent;
            g.expand(generateStatement, stmt.body[i], GenOpts.programBodyItem(!safeConcatenation && i === lastIdx));

            if (i !== lastIdx)
                _.js += newline;
        }
    },

    FunctionDeclaration: function generateFunctionDeclaration(g, stmt) {
        var isGenerator = !!stmt.generator;

        _.js += isGenerator ? ('function*' + optSpace) : ('function' + space );
        _.js += stmt.id.name;
        generateFunctionBody(g, stmt);
    },

    ReturnStatement: function generateReturnStatement(g, stmt, opt) {
        if (stmt.argument) {
            var arg = g.generate(generateExpression, stmt.argument, GenOpts.returnStmtArg);

            _.js += joinWithSpacing('return', arg) + opt.semicolon;
        }

        else
            _.js += 'return' + opt.semicolon;
    },

    WhileStatement: function generateWhileStatement(g, stmt, opt) {
        var prevIndent = shiftIndent();

        _.js += 'while' + optSpace + '(';
        g.expand(generateExpression, stmt.test, GenOpts.whileStmtTest);
        _.js += ')';
        indent = prevIndent;

        _.js += adoptionPrefix(stmt.body);
        g.expand(generateStatement, stmt.body, GenOpts.whileStmtBody(opt.semicolon === ''));
    },

    WithStatement: function generateWithStatement(g, stmt, opt) {
        var prevIndent = shiftIndent();

        _.js += 'with' + optSpace + '(';
        g.expand(generateExpression, stmt.object, GenOpts.withStmtObj);
        _.js += ')';
        indent = prevIndent;

        _.js += adoptionPrefix(stmt.body);
        g.expand(generateStatement, stmt.body, GenOpts.withStmtBody(opt.semicolon === ''));

    }
};

function generateStatement(g, stmt, option) {
    var allowIn = true,
        semicolon = ';',
        functionBody = false,
        directiveContext = false;

    if (option) {
        allowIn = option.allowIn === void 0 || option.allowIn;
        if (!semicolons && option.semicolonOptional === true) {
            semicolon = '';
        }
        functionBody = option.functionBody;
        directiveContext = option.directiveContext;
    }

    StmtGen[stmt.type](g, stmt, {
        allowIn: allowIn,
        semicolon: semicolon,
        functionBody: functionBody,
        directiveContext: directiveContext
    });
}

function generateInternal(g, node) {
    if (isStatement(node))
        generateStatement(g, node);

    else if (isExpression(node))
        generateExpression(g, node, {
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
    _.js = '';
};

CodeGen.prototype.generate = function (proc, node, opt) {
    var savedJs = _.js;
    _.js = '';

    proc(this, node, opt);

    var result = _.js;
    _.js = savedJs;

    return result;
};

CodeGen.prototype.expand = function (proc, node, opt) {
    proc(this, node, opt);
};

CodeGen.run = function (node) {
    var cg = new CodeGen();
    generateInternal(cg, node);

    return _.js;
};

/**
 * Strings
 */

var _ = {
    js: ''
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

    return CodeGen.run(node);
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

exports.version = require('./package.json').version;
exports.generate = generate;
exports.Precedence = updateDeeply({}, Precedence);
exports.browser = false;
exports.FORMAT_MINIFY = FORMAT_MINIFY;
exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
