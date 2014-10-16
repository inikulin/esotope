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
    json,
    renumber,
    hexadecimal,
    quotes,
    escapeless,
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
        return left + _.space + right;
    }

    else if (esutils.code.isWhiteSpace(leftCp) || esutils.code.isLineTerminator(leftCp) ||
             esutils.code.isWhiteSpace(rightCp) || esutils.code.isLineTerminator(rightCp)) {
        return left + right;
    }
    return left + _.optSpace + right;
}

function shiftIndent() {
    var prevIndent = _.indent;

    _.indent += _.indentUnit;
    return prevIndent;
}

function adoptionPrefix($stmt) {
    if ($stmt.type === Syntax.BlockStatement)
        return _.optSpace;

    if ($stmt.type === Syntax.EmptyStatement)
        return '';

    return _.newline + _.indent + _.indentUnit;
}

function adoptionSuffix($stmt) {
    if ($stmt.type === Syntax.BlockStatement)
        return _.optSpace;

    return _.newline + _.indent;
}

/**
 * Subentities generators
 */
function generateVerbatim($expr, settings) {
    var verbatim = $expr[extra.verbatim],
        strVerbatim = typeof verbatim === 'string',
        precedence = !strVerbatim && verbatim.precedence !== void 0 ? verbatim.precedence : Precedence.Sequence,
        parenthesize = precedence < settings.precedence,
        content = strVerbatim ? verbatim : verbatim.content,
        chunks = content.split(/\r\n|\n/),
        chunkCount = chunks.length;

    if (parenthesize)
        _.js += '(';

    _.js += chunks[0];

    for (var i = 1; i < chunkCount; i++)
        _.js += _.newline + _.indent + chunks[i];

    if (parenthesize)
        _.js += ')';
}

function generateFunctionParams($node) {
    var $params = $node.params,
        $rest = $node.rest,
        $defaults = $node.defaults,
        paramCount = $params.length,
        lastParamIdx = paramCount - 1,
        hasDefaults = !!$defaults,
        arrowFuncWithSingleParam = $node.type === Syntax.ArrowFunctionExpression && !$rest &&
                                   (!hasDefaults || $defaults.length === 0) &&
                                   paramCount === 1 &&
                                   $params[0].type === Syntax.Identifier;

    // arg => { } case
    if (arrowFuncWithSingleParam)
        _.js += $params[0].name;

    else {
        _.js += '(';

        for (var i = 0; i < paramCount; ++i) {
            var $param = $params[i];

            if (hasDefaults && $defaults[i]) {
                var $fakeAssign = {
                    left: $param,
                    right: $defaults[i],
                    operator: '='
                };

                ExprGen.AssignmentExpression($fakeAssign, Settings.funcArg);
            }

            else {
                if ($params[i].type === Syntax.Identifier)
                    _.js += $param.name;

                else
                    ExprGen[$param.type]($param, Settings.funcArg);
            }

            if (i !== lastParamIdx)
                _.js += ',' + _.optSpace;
        }

        if ($rest) {
            if (paramCount)
                _.js += ',' + _.optSpace;

            _.js += '...' + $rest.name;
        }

        _.js += ')';
    }
}

function generateFunctionBody($node) {
    var $body = $node.body;

    generateFunctionParams($node);

    if ($node.type === Syntax.ArrowFunctionExpression)
        _.js += _.optSpace + '=>';

    if ($node.expression) {
        _.js += _.optSpace;

        var expr = source(generateExpression, $body, Settings.funcBodyExpr);

        if (expr.charAt(0) === '{')
            expr = '(' + expr + ')';

        _.js += expr;
    }

    else {
        _.js += adoptionPrefix($body);
        StmtGen[$body.type]($body, Settings.funcBodyStmt);
    }
}


function canUseRawLiteral($expr) {
    if ($expr.hasOwnProperty('raw')) {
        try {
            var raw = parse($expr.raw).body[0].expression;

            return raw.type === Syntax.Literal && raw.value === $expr.value;
        } catch (e) {
            // not use raw property
        }
    }

    return false;
}

function generateLiteral($expr) {
    if (parse && extra.raw && canUseRawLiteral($expr)) {
        return $expr.raw;
    }

    if ($expr.value === null) {
        return 'null';
    }

    var valueType = typeof $expr.value;

    if (valueType === 'string') {
        return escapeString($expr.value);
    }

    if (valueType === 'number') {
        return generateNumber($expr.value);
    }

    if (valueType === 'boolean') {
        return $expr.value ? 'true' : 'false';
    }

    return generateRegExp($expr.value);
}


//-------------------------------------------------===------------------------------------------------------
//                                Syntactic entities generation settings
//-------------------------------------------------===------------------------------------------------------

var Settings = {
    //TODO e
    sequenceExprChildren: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO e
    conditionalExprTest: function (allowIn) {
        return {
            precedence: Precedence.LogicalOR,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO e
    conditionalExprBranch: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO e
    callExprCallee: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: false
    },

    //TODO e
    callExprArgs: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    blockStmtBodyItem: function (functionBody, semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: functionBody,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    classBodyItem: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    classDeclarationSuperClass: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    classDeclarationBody: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: true
    },

    //TODO e
    varDeclarator: function (allowIn) {
        return {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO s
    varDeclaration: function (allowIn) {
        return {
            allowIn: allowIn,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: false
        };
    },

    //TODO e
    switchStmtDiscriminant: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    switchStmtCase: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO s
    programBodyItem: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: true,
            semicolonOptional: semicolonOptional,
        };
    },

    //TODO e
    newExprCallee: function (allowUnparenthesizedNew) {
        return {
            precedence: Precedence.New,
            allowIn: true,
            allowCall: false,
            allowUnparenthesizedNew: allowUnparenthesizedNew
        };
    },

    //TODO e
    newExprArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },


    //TODO e
    yieldExprArg: {
        precedence: Precedence.Yield,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    prefixUpdateExprArg: {
        precedence: Precedence.Unary,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    postfixUpdateExprArg: {
        precedence: Precedence.Postfix,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    arrayExprElement: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    classExprId: {
        precedence: void 0,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    classExprSuperClass: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    classExprBody: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: true
    },

    //TODO e
    propKey: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    //TODO e
    propVal: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    objPatternProp: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    comprBlockVarDeclaration: {
        allowIn: false,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    comprBlockLeftExpr: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    comprBlockRightExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    spreadElementArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    taggedTemplateExprTag: function (allowCall) {
        return {
            precedence: Precedence.Call,
            allowIn: true,
            allowCall: allowCall,
            allowUnparenthesizedNew: false
        };
    },

    //TODO e
    taggedTemplateExprQuasi: {
        precedence: Precedence.Primary,
        allowIn: void 0,
        allowCall: void 0,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    templateLiteralQuasi: {
        precedence: Precedence.Primary,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    templateLiteralExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    throwStmtArg: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    objExprProperty: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true
    },

    //TODO s
    doWhileStmtBody: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    doWhileStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    catchClauseGuard: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    catchClauseParam: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    catchClauseBody: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    exprStmtExpr: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    ifStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    ifStmtConseqWithAlt: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO s
    ifStmtAlt: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO s
    ifStmtConseq: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    returnStmtArg: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    whileStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    whileStmtBody: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    withStmtObj: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    withStmtBody: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO s
    labeledStmtBody: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO s
    forStmtVarInit: {
        allowIn: false,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    forStmtInit: {
        precedence: Precedence.Sequence,
        allowIn: false,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    forStmtTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    forStmtUpdate: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    forStmtBody: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    switchCaseTest: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    switchCaseConseqBlock: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO s
    switchCaseConseq: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    exportDeclSpec: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    exportDeclDefaultDecl: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    exportDeclDecl: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO s
    tryStmtBlock: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO s
    tryStmtHandler: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO s
    tryStmtFinalizer: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    memberExprObj: function (allowCall) {
        return {
            precedence: Precedence.Call,
            allowIn: true,
            allowCall: allowCall,
            allowUnparenthesizedNew: false
        };
    },

    //TODO e
    memberExprProp: function (allowCall) {
        return {
            precedence: Precedence.Sequence,
            allowIn: true,
            allowCall: allowCall,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO e
    importDeclSpec: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    genExprBody: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    genExprBlock: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    genExprFilter: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    unaryExprArg: {
        precedence: Precedence.Unary,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    binExprOperand: function (precedence, allowIn) {
        return {
            precedence: precedence,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        };
    },

    //TODO s
    forIterVarDecl: {
        allowIn: false,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    forStmtIterLeft: {
        precedence: Precedence.Call,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    forStmtIterRight: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    forStmtIterBody: function (semicolonOptional) {
        return {
            allowIn: true,
            functionBody: false,
            directiveContext: false,
            semicolonOptional: semicolonOptional
        };
    },

    //TODO e
    assignExprLeftOperand: function (allowIn) {
        return  {
            precedence: Precedence.Call,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        }
    },

    //TODO e
    assignExprRightOperand: function (allowIn) {
        return  {
            precedence: Precedence.Assignment,
            allowIn: allowIn,
            allowCall: true,
            allowUnparenthesizedNew: void 0
        }
    },

    //TODO e
    funcBodyExpr: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO s
    funcBodyStmt: {
        allowIn: true,
        functionBody: true,
        directiveContext: false,
        semicolonOptional: false
    },

    //TODO e
    funcArg: {
        precedence: Precedence.Assignment,
        allowIn: true,
        allowCall: true,
        allowUnparenthesizedNew: void 0
    },

    //TODO e
    exprInitial: {
        precedence: Precedence.Sequence,
        allowIn: true,
        allowCall: true,
        semicolonOptional: false
    },

    //TODO s
    stmtInitial: {
        allowIn: true,
        functionBody: false,
        directiveContext: false,
        semicolonOptional: false
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
function generateLogicalOrBinaryExpression($expr, settings) {
    var op = $expr.operator,
        precedence = BinaryPrecedence[$expr.operator],
        parenthesize = precedence < settings.precedence,
        allowIn = settings.allowIn || parenthesize,
        operandGenSettings = Settings.binExprOperand(precedence, allowIn),
        js = source(generateExpression, $expr.left, operandGenSettings);

    parenthesize |= op === 'in' && !allowIn;

    if (parenthesize)
        _.js += '(';

    if (js.charCodeAt(js.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(op.charCodeAt(0)))
        js = js + _.space + op;

    else
        js = joinWithSpacing(js, op);

    operandGenSettings.precedence++;

    var right = source(generateExpression, $expr.right, operandGenSettings);

    // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
    if (op === '/' && right.charAt(0) === '/' || op.slice(-1) === '<' && right.slice(0, 3) === '!--')
        js += _.space + right;

    else
        js = joinWithSpacing(js, right);

    _.js += js;

    if (parenthesize)
        _.js += ')';
}

function generateArrayPatternOrExpression($expr) {
    var $elems = $expr.elements,
        elemCount = $elems.length;

    if (elemCount) {
        var lastElemIdx = elemCount - 1,
            multiline = elemCount > 1,
            prevIndent = shiftIndent(),
            itemPrefix = _.newline + _.indent;

        _.js += '[';

        for (var i = 0; i < elemCount; i++) {
            var $elem = $elems[i];

            if (multiline)
                _.js += itemPrefix;

            if ($elem)
                ExprGen[$elem.type]($elem, Settings.arrayExprElement);

            if (i !== lastElemIdx || !$elem)
                _.js += ',';
        }

        _.indent = prevIndent;

        if (multiline)
            _.js += _.newline + _.indent;

        _.js += ']';
    }

    else
        _.js += '[]';
}

function generateImportOrExportSpecifier($expr) {
    _.js += $expr.id.name;

    if ($expr.name)
        _.js += _.space + 'as' + _.space + $expr.name.name;
}

function generateGeneratorOrComprehensionExpression($expr) {
    // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
    var isGenerator = $expr.type === Syntax.GeneratorExpression,
        js = isGenerator ? '(' : '[',
        body = source(generateExpression, $expr.body, Settings.genExprBody);

    if ($expr.blocks) {
        var prevIndent = shiftIndent(),
            blockCount = $expr.blocks.length;

        for (var i = 0; i < blockCount; ++i) {
            var block = source(generateExpression, $expr.blocks[i], Settings.genExprBlock);

            js = i > 0 ? joinWithSpacing(js, block) : (js + block);
        }

        _.indent = prevIndent;
    }

    if ($expr.filter) {
        var filter = source(generateExpression, $expr.filter, Settings.genExprFilter);
        js = joinWithSpacing(js, 'if' + _.optSpace);
        js = joinWithSpacing(js, '(' + filter + ')');
    }

    js = joinWithSpacing(js, body);
    js += isGenerator ? ')' : ']';

    _.js += js;
}


/**
 * Expression raw generator dictionary
 */
var ExprRawGen = {
    SequenceExpression: function generateSequenceExpression($expr, settings) {
        var $children = $expr.expressions,
            childrenCount = $children.length,
            lastChildIdx = childrenCount - 1,
            parenthesize = Precedence.Sequence < settings.precedence,
            exprGenSettings = Settings.sequenceExprChildren(settings.allowIn || parenthesize);

        if (parenthesize)
            _.js += '(';

        for (var i = 0; i < childrenCount; i++) {
            var $child = $children[i];

            ExprGen[$child.type]($child, exprGenSettings);

            if (i !== lastChildIdx)
                _.js += ',' + _.optSpace;
        }

        if (parenthesize)
            _.js += ')';
    },

    AssignmentExpression: function generateAssignmentExpression($expr, settings) {
        var $left = $expr.left,
            $right = $expr.right,
            parenthesize = Precedence.Assignment < settings.precedence,
            allowIn = settings.allowIn || parenthesize;

        if (parenthesize)
            _.js += '(';

        ExprGen[$left.type]($left, Settings.assignExprLeftOperand(allowIn));
        _.js += _.optSpace + $expr.operator + _.optSpace;
        ExprGen[$right.type]($right, Settings.assignExprRightOperand(allowIn));

        if (parenthesize)
            _.js += ')';
    },

    ArrowFunctionExpression: function generateArrowFunctionExpression($expr, settings) {
        var parenthesize = Precedence.ArrowFunction < settings.precedence;

        if (parenthesize)
            _.js += '(';

        generateFunctionBody($expr);

        if (parenthesize)
            _.js += ')';
    },

    ConditionalExpression: function generateConditionalExpression($expr, settings) {
        var $test = $expr.test,
            $conseq = $expr.consequent,
            $alt = $expr.alternate,
            parenthesize = Precedence.Conditional < settings.precedence,
            allowIn = settings.allowIn || parenthesize,
            testGenSettings = Settings.conditionalExprTest(allowIn),
            branchGenSettings = Settings.conditionalExprBranch(allowIn);

        if (parenthesize)
            _.js += '(';

        ExprGen[$test.type]($test, testGenSettings);
        _.js += _.optSpace + '?' + _.optSpace;
        ExprGen[$conseq.type]($conseq, branchGenSettings);
        _.js += _.optSpace + ':' + _.optSpace;
        ExprGen[$alt.type]($alt, branchGenSettings);

        if (parenthesize)
            _.js += ')';
    },

    LogicalExpression: generateLogicalOrBinaryExpression,

    BinaryExpression: generateLogicalOrBinaryExpression,

    CallExpression: function generateCallExpression($expr, settings) {
        var $callee = $expr.callee,
            $args = $expr['arguments'],
            argCount = $args.length,
            lastArgIdx = argCount - 1,
            parenthesize = !settings.allowCall || Precedence.Call < settings.precedence;

        if (parenthesize)
            _.js += '(';

        ExprGen[$callee.type]($callee, Settings.callExprCallee);
        _.js += '(';

        for (var i = 0; i < argCount; ++i) {
            var $arg = $args[i];

            ExprGen[$arg.type]($arg, Settings.callExprArgs);

            if (i !== lastArgIdx)
                _.js += ',' + _.optSpace;
        }

        _.js += ')';

        if (parenthesize)
            _.js += ')';
    },

    NewExpression: function generateNewExpression($expr, settings) {
        var $args = $expr['arguments'],
            parenthesize = Precedence.New < settings.precedence,
            argCount = $args.length,
            lastArgIdx = argCount - 1,
            allowUnparenthesizedNew = settings.allowUnparenthesizedNew === void 0 || settings.allowUnparenthesizedNew,
            withCall = !allowUnparenthesizedNew || parentheses || argCount > 0,
            callee = source(generateExpression, $expr.callee, Settings.newExprCallee(!withCall));

        if (parenthesize)
            _.js += '(';

        _.js += joinWithSpacing('new', callee);

        if (withCall) {
            _.js += '(';

            for (var i = 0; i < argCount; ++i) {
                var $arg = $args[i];

                ExprGen[$arg.type]($arg, Settings.newExprArg);

                if (i !== lastArgIdx)
                    _.js += ',' + _.optSpace;
            }

            _.js += ')';
        }

        if (parenthesize)
            _.js += ')';
    },

    MemberExpression: function generateMemberExpression($expr, settings) {
        var $obj = $expr.object,
            $prop = $expr.property,
            parenthesize = Precedence.Member < settings.precedence,
            isNumObj = !$expr.computed && $obj.type === Syntax.Literal && typeof $obj.value === 'number';

        if (parenthesize)
            _.js += '(';

        if (isNumObj) {
            // When the following conditions are all true:
            //   1. No floating point
            //   2. Don't have exponents
            //   3. The last character is a decimal digit
            //   4. Not hexadecimal OR octal number literal
            // we should add a floating point.

            var num = source(generateExpression, $obj, Settings.memberExprObj(settings.allowCall)),
                withPoint = LAST_DECIMAL_DIGIT_REGEXP.test(num) && !FLOATING_OR_OCTAL_REGEXP.test(num);

            _.js += withPoint ? (num + '.') : num;
        }

        else
            ExprGen[$obj.type]($obj, Settings.memberExprObj(settings.allowCall));

        if ($expr.computed) {
            _.js += '[';
            ExprGen[$prop.type]($prop, Settings.memberExprProp(settings.allowCall));
            _.js += ']';
        }

        else
            _.js += '.' + $prop.name;

        if (parenthesize)
            _.js += ')';
    },

    UnaryExpression: function generateUnaryExpression($expr, settings) {
        var parenthesize = Precedence.Unary < settings.precedence,
            op = $expr.operator,
            arg = source(generateExpression, $expr.argument, Settings.unaryExprArg);

        if (parenthesize)
            _.js += '(';

        // delete, void, typeof
        // get `typeof []`, not `typeof[]`
        if (_.optSpace === '' || op.length > 2)
            _.js += joinWithSpacing(op, arg);

        else {
            _.js += op;

            // Prevent inserting spaces between operator and argument if it is unnecessary
            // like, `!cond`
            var left = op.charCodeAt(op.length - 1),
                right = arg.charCodeAt(0);

            if (((left === 0x2B  /* + */ || left === 0x2D  /* - */) && left === right) ||
                (esutils.code.isIdentifierPart(left) && esutils.code.isIdentifierPart(right))) {
                _.js += _.space;
            }

            _.js += arg;
        }

        if (parenthesize)
            _.js += ')';
    },

    YieldExpression: function generateYieldExpression($expr, settings) {
        var js = $expr.delegate ? 'yield*' : 'yield',
            parenthesize = Precedence.Yield < settings.precedence;

        if (parenthesize)
            _.js += '(';

        if ($expr.argument) {
            var arg = source(generateExpression, $expr.argument, Settings.yieldExprArg);

            js = joinWithSpacing(js, arg);
        }

        _.js += js;

        if (parenthesize)
            _.js += ')';
    },

    UpdateExpression: function generateUpdateExpression($expr, settings) {
        var $arg = $expr.argument,
            $op = $expr.operator,
            prefix = $expr.prefix,
            precedence = prefix ? Precedence.Unary : Precedence.Postfix,
            parenthesize = precedence < settings.precedence;

        if (parenthesize)
            _.js += '(';

        if (prefix) {
            _.js += $op;
            ExprGen[$arg.type]($arg, Settings.postfixUpdateExprArg);

        }

        else {
            ExprGen[$arg.type]($arg, Settings.postfixUpdateExprArg);
            _.js += $op;
        }

        if (parenthesize)
            _.js += ')';
    },

    FunctionExpression: function generateFunctionExpression($expr) {
        var isGenerator = !!$expr.generator;

        _.js += isGenerator ? 'function*' : 'function';

        if ($expr.id) {
            _.js += isGenerator ? _.optSpace : _.space;
            _.js += $expr.id.name;
        }
        else
            _.js += _.optSpace;

        generateFunctionBody($expr);
    },

    ExportBatchSpecifier: function generateExportBatchSpecifier() {
        _.js += '*';
    },

    ArrayPattern: generateArrayPatternOrExpression,

    ArrayExpression: generateArrayPatternOrExpression,

    ClassExpression: function generateClassExpression($expr) {
        var $body = $expr.body,
            js = 'class';

        if ($expr.id) {
            var id = source(generateExpression, $expr.id, Settings.classExprId);

            js = joinWithSpacing(js, id);
        }

        if ($expr.superClass) {
            var superClass = source(generateExpression, $expr.superClass, Settings.classExprSuperClass);

            superClass = joinWithSpacing('extends', superClass);
            js = joinWithSpacing(js, superClass);
        }

        _.js += js + _.optSpace;
        StmtGen[$body.type]($body, Settings.classExprBody);
    },

    MethodDefinition: function generateMethodDefinition($expr) {
        var js = $expr['static'] ? 'static' + _.optSpace : '',
            propKey = source(generateExpression, $expr.key, Settings.propKey);

        if ($expr.computed)
            propKey = '[' + propKey + ']';

        var body = source(generateFunctionBody, $expr.value),
            propKeyWithBody = propKey + body;

        if ($expr.kind === 'get' || $expr.kind === 'set') {
            propKeyWithBody = joinWithSpacing($expr.kind, propKeyWithBody);
            js = joinWithSpacing(js, propKeyWithBody);
        }

        else {
            if ($expr.value.generator)
                js += '*' + propKeyWithBody;

            else
                js = joinWithSpacing(js, propKeyWithBody);
        }

        _.js += js;
    },

    Property: function generateProperty($expr) {
        var $val = $expr.value,
            $kind = $expr.kind,
            key = source(generateExpression, $expr.key, Settings.propKey);

        if ($expr.computed)
            key = '[' + key + ']';

        if ($kind === 'get' || $kind === 'set') {
            _.js += $kind + _.space + key;
            generateFunctionBody($val);
        }

        else {
            if ($expr.shorthand)
                _.js += key;

            else if ($expr.method) {
                _.js += $val.generator ? ('*' + key) : key;
                generateFunctionBody($val)
            }

            else {
                _.js += key + ':' + _.optSpace;
                ExprGen[$val.type]($val, Settings.propVal);
            }
        }
    },

    ObjectExpression: function generateObjectExpression($expr) {
        var $props = $expr.properties,
            propCount = $props.length;

        if (propCount) {
            var lastPropIdx = propCount - 1,
                prevIndent = shiftIndent();

            _.js += '{';

            for (var i = 0; i < propCount; i++) {
                var $prop = $props[i],
                    propType = $prop.type || Syntax.Property;

                _.js += _.newline + _.indent;
                ExprGen[propType]($prop, Settings.objExprProperty);

                if (i !== lastPropIdx)
                    _.js += ',';
            }

            _.indent = prevIndent;
            _.js += _.newline + _.indent + '}';
        }

        else
            _.js += '{}';
    },

    ObjectPattern: function generateObjectPattern($expr) {
        var $props = $expr.properties,
            propCount = $props.length;

        if (propCount) {
            var lastPropIdx = propCount - 1,
                multiline = false;

            if (propCount === 1)
                multiline = $props[0].value.type !== Syntax.Identifier;

            else {
                for (var i = 0; i < propCount; i++) {
                    if (!$props[i].shorthand) {
                        multiline = true;
                        break;
                    }
                }
            }

            _.js += multiline ? ('{' + _.newline) : '{';

            var prevIndent = shiftIndent(),
                propSuffix = ',' + (multiline ? _.newline : _.optSpace);

            for (var i = 0; i < propCount; i++) {
                var $prop = $props[i];

                if (multiline)
                    _.js += _.indent;

                ExprGen[$prop.type]($prop, Settings.objPatternProp);

                if (i !== lastPropIdx)
                    _.js += propSuffix;
            }

            _.indent = prevIndent;
            _.js += multiline ? (_.newline + _.indent + '}') : '}';
        }
        else
            _.js += '{}';
    },

    ThisExpression: function generateThisExpression() {
        _.js += 'this';
    },

    Identifier: function generateIdentifier($expr) {
        _.js += $expr.name;
    },

    ImportSpecifier: generateImportOrExportSpecifier,

    ExportSpecifier: generateImportOrExportSpecifier,

    Literal: function ($expr) {
        _.js += generateLiteral($expr);
    },

    GeneratorExpression: generateGeneratorOrComprehensionExpression,

    ComprehensionExpression: generateGeneratorOrComprehensionExpression,

    ComprehensionBlock: function generateComprehensionBlock($expr) {
        var left = void 0,
            right = source(generateExpression, $expr.right, Settings.comprBlockRightExpr);

        if ($expr.left.type === Syntax.VariableDeclaration) {
            left = $expr.left.kind +
                   _.space +
                   source(generateStatement, $expr.left.declarations[0], Settings.comprBlockVarDeclaration);
        }

        else
            left = source(generateExpression, $expr.left, Settings.comprBlockLeftExpr);

        left = joinWithSpacing(left, $expr.of ? 'of' : 'in');

        _.js += 'for' + _.optSpace + '(' + joinWithSpacing(left, right) + ')';
    },

    SpreadElement: function generateSpreadElement($expr) {
        var $arg = $expr.argument;

        _.js += '...';
        ExprGen[$arg.type]($arg, Settings.spreadElementArg);
    },

    TaggedTemplateExpression: function generateTaggedTemplateExpression($expr, settings) {
        var $tag = $expr.tag,
            $quasi = $expr.quasi,
            parenthesize = Precedence.TaggedTemplate < settings.precedence;

        if (parenthesize)
            _.js += '(';

        ExprGen[$tag.type]($tag, Settings.taggedTemplateExprTag(settings.allowCall));
        ExprGen[$quasi.type]($quasi, Settings.taggedTemplateExprQuasi);

        if (parenthesize)
            _.js += ')';
    },

    TemplateElement: function generateTemplateElement($expr) {
        // Don't use "cooked". Since tagged template can use raw template
        // representation. So if we do so, it breaks the script semantics.
        _.js += $expr.value.raw;
    },

    TemplateLiteral: function generateTemplateLiteral($expr) {
        var $quasis = $expr.quasis,
            $childExprs = $expr.expressions,
            quasiCount = $quasis.length,
            lastQuasiIdx = quasiCount - 1;

        _.js += '`';

        for (var i = 0; i < quasiCount; ++i) {
            var $quasi = $quasis[i];

            ExprGen[$quasi.type]($quasi, Settings.templateLiteralQuasi);

            if (i !== lastQuasiIdx) {
                var $childExpr = $childExprs[i];

                _.js += '${' + _.optSpace;
                ExprGen[$childExpr.type]($childExpr, Settings.templateLiteralExpr);
                _.js += _.optSpace + '}';
            }
        }

        _.js += '`';
    }
};

function generateExpression($expr, option) {
    ExprGen[$expr.type]($expr, option);
}

//-------------------------------------------------===------------------------------------------------------
//                                              Statements
//-------------------------------------------------===------------------------------------------------------


/**
 * Regular expressions
 */
var EXPR_STMT_UNALLOWED_EXPR_REGEXP = /^{|^class(?:\s|{)|^function(?:\s|\*|\()/;


/**
 * Common statement generators
 */

function generateTryStatementHandlers(js, finalizer, handlers) {
    var handlerCount = handlers.length,
        lastHandlerIdx = handlerCount - 1;

    for (var i = 0; i < handlerCount; ++i) {
        var handler = source(generateStatement, handlers[i], Settings.tryStmtHandler);

        js = joinWithSpacing(js, handler);

        if (finalizer || i !== lastHandlerIdx)
            js += adoptionSuffix(handlers[i].body);
    }

    return js;
}

function generateForStatementIterator($op, $stmt, settings) {
    var $body = $stmt.body,
        bodySemicolonOptional = !semicolons && settings.semicolonOptional,
        prevIndent1 = shiftIndent(),
        js = 'for' + _.optSpace + '(';

    if ($stmt.left.type === Syntax.VariableDeclaration) {
        var prevIndent2 = shiftIndent();
        js += $stmt.left.kind + _.space;
        js += source(generateStatement, $stmt.left.declarations[0], Settings.forIterVarDecl);
        _.indent = prevIndent2;
    }

    else
        js += source(generateExpression, $stmt.left, Settings.forStmtIterLeft);

    js = joinWithSpacing(js, $op);

    var right = source(generateExpression, $stmt.right, Settings.forStmtIterRight);

    js = joinWithSpacing(js, right) + ')';

    _.indent = prevIndent1;

    _.js += js + adoptionPrefix($body);
    StmtGen[$body.type]($body, Settings.forStmtIterBody(bodySemicolonOptional));
}

/**
 * Statement generator dictionary
 */
var StmtRawGen = {
    BlockStatement: function generateBlockStatement($stmt, settings) {
        var $body = $stmt.body,
            len = $body.length,
            lastIdx = len - 1,
            prevIndent = shiftIndent();

        _.js += '{' + _.newline;

        for (var i = 0; i < len; i++) {
            var $item = $body[i];

            _.js += _.indent;
            StmtGen[$item.type]($item, Settings.blockStmtBodyItem(settings.functionBody, i === lastIdx));
            _.js += _.newline;
        }

        _.indent = prevIndent;
        _.js += _.indent + '}';
    },

    BreakStatement: function generateBreakStatement($stmt, settings) {
        if ($stmt.label)
            _.js += 'break ' + $stmt.label.name;

        else
            _.js += 'break';

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    ContinueStatement: function generateContinueStatement($stmt, settings) {
        if ($stmt.label)
            _.js += 'continue ' + $stmt.label.name;

        else
            _.js += 'continue';

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    ClassBody: function generateClassBody($stmt) {
        var $body = $stmt.body,
            itemCount = $body.length,
            lastItemIdx = itemCount - 1,
            prevIndent = shiftIndent();

        _.js += '{' + _.newline;

        for (var i = 0; i < itemCount; i++) {
            var $item = $body[i],
                itemType = $item.type || Syntax.Property;

            _.js += _.indent;
            ExprGen[itemType]($item, Settings.classBodyItem);

            if (i !== lastItemIdx)
                _.js += _.newline;
        }

        _.indent = prevIndent;
        _.js += _.newline + _.indent + '}';
    },

    ClassDeclaration: function generateClassDeclaration($stmt) {
        var $body = $stmt.body,
            js = 'class ' + $stmt.id.name;

        if ($stmt.superClass) {
            var fragment = source(generateExpression, $stmt.superClass, Settings.classDeclarationSuperClass);

            js += _.space + joinWithSpacing('extends', fragment);
        }

        _.js += js + _.optSpace;
        StmtGen[$body.type]($body, Settings.classDeclarationBody);
    },

    DirectiveStatement: function generateDirectiveStatement($stmt, settings) {
        if (extra.raw && $stmt.raw)
            _.js += $stmt.raw;

        else
            _.js += escapeDirective($stmt.directive);

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    DoWhileStatement: function generateDoWhileStatement($stmt, settings) {
        var $body = $stmt.body,
            $test = $stmt.test,
            body = adoptionPrefix($body) +
                   source(generateStatement, $body, Settings.doWhileStmtBody) +
                   adoptionSuffix($body);

        //NOTE: Because `do 42 while (cond)` is Syntax Error. We need semicolon.
        var js = joinWithSpacing('do', body);
        js = joinWithSpacing(js, 'while' + _.optSpace + '(');

        _.js += js;
        ExprGen[$test.type]($test, Settings.doWhileStmtTest);
        _.js += ')';

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    CatchClause: function generateCatchClause($stmt) {
        var $param = $stmt.param,
            $guard = $stmt.guard,
            $body = $stmt.body,
            prevIndent = shiftIndent();

        _.js += 'catch' + _.optSpace + '(';
        ExprGen[$param.type]($param, Settings.catchClauseParam);

        if ($guard) {
            _.js += ' if ';
            ExprGen[$guard.type]($guard, Settings.catchClauseGuard);
        }

        _.indent = prevIndent;
        _.js += ')' + adoptionPrefix($body);
        StmtGen[$body.type]($body, Settings.catchClauseBody);
    },

    DebuggerStatement: function generateDebuggerStatement($stmt, settings) {
        _.js += 'debugger';

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    EmptyStatement: function generateEmptyStatement() {
        _.js += ';';
    },

    ExportDeclaration: function generateExportDeclaration($stmt, settings) {
        var withSemicolon = semicolons || !settings.semicolonOptional;

        // export default AssignmentExpression[In] ;
        if ($stmt['default']) {
            var decl = source(generateExpression, $stmt.declaration, Settings.exportDeclDefaultDecl);

            _.js += joinWithSpacing('export default', decl);

            if (withSemicolon)
                _.js += ';';
        }

        // export * FromClause ;
        // export ExportClause[NoReference] FromClause ;
        // export ExportClause ;
        else if ($stmt.specifiers) {
            var js = 'export';

            if ($stmt.specifiers.length === 0)
                js += _.optSpace + '{' + _.optSpace + '}';

            else if ($stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
                var spec = source(generateExpression, $stmt.specifiers[0], Settings.exportDeclSpec);

                js = joinWithSpacing(js, spec);
            }

            else {
                var prevIndent = shiftIndent(),
                    specCount = $stmt.specifiers.length,
                    lastSpecIdx = specCount - 1;

                js += _.optSpace + '{';

                for (var i = 0; i < specCount; ++i) {
                    js += _.newline + _.indent;
                    js += source(generateExpression, $stmt.specifiers[i], Settings.exportDeclSpec);

                    if (i !== lastSpecIdx)
                        js += ',';
                }

                _.indent = prevIndent;
                js += _.newline + _.indent + '}';
            }

            if ($stmt.source)
                js = joinWithSpacing(js, 'from' + _.optSpace + generateLiteral($stmt.source));

            _.js += js;

            if (withSemicolon)
                _.js += ';';
        }

        // export VariableStatement
        // export Declaration[Default]
        else if ($stmt.declaration) {
            var decl = source(generateStatement, $stmt.declaration, Settings.exportDeclDecl(!withSemicolon));

            _.js += joinWithSpacing('export', decl);
        }
    },

    ExpressionStatement: function generateExpressionStatement($stmt, settings) {
        var exprSource = source(generateExpression, $stmt.expression, Settings.exprStmtExpr),
            parenthesize = EXPR_STMT_UNALLOWED_EXPR_REGEXP.test(exprSource) ||
                           (directive &&
                            settings.directiveContext &&
                            $stmt.expression.type === Syntax.Literal &&
                            typeof $stmt.expression.value === 'string');

        // '{', 'function', 'class' are not allowed in expression statement.
        // Therefore, they should be parenthesized.
        if (parenthesize)
            _.js += '(' + exprSource + ')';

        else
            _.js += exprSource;

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    ImportDeclaration: function generateImportDeclaration($stmt, settings) {
        var js = 'import',
            specCount = $stmt.specifiers.length;

        // If no ImportClause is present,
        // this should be `import ModuleSpecifier` so skip `from`
        // ModuleSpecifier is StringLiteral.
        if (specCount) {
            var hasBinding = !!$stmt.specifiers[0]['default'],
                firstNamedIdx = hasBinding ? 1 : 0,
                lastSpecIdx = specCount - 1;

            // ImportedBinding
            if (hasBinding)
                js = joinWithSpacing(js, $stmt.specifiers[0].id.name);

            // NamedImports
            if (firstNamedIdx < specCount) {
                if (hasBinding)
                    js += ',';

                js += _.optSpace + '{';

                // import { ... } from "...";
                if (firstNamedIdx === lastSpecIdx) {
                    js += _.optSpace +
                          source(generateExpression, $stmt.specifiers[firstNamedIdx], Settings.importDeclSpec) +
                          _.optSpace;
                }

                else {
                    var prevIndent = shiftIndent();

                    // import {
                    //    ...,
                    //    ...,
                    // } from "...";
                    for (var i = firstNamedIdx; i < specCount; i++) {
                        js += _.newline +
                              _.indent +
                              source(generateExpression, $stmt.specifiers[i], Settings.importDeclSpec);

                        if (i !== lastSpecIdx)
                            js += ',';
                    }

                    _.indent = prevIndent;
                    js += _.newline + _.indent;
                }

                js += '}' + _.optSpace;
            }

            js = joinWithSpacing(js, 'from')
        }

        js += _.optSpace + generateLiteral($stmt.source);

        if (semicolons || !settings.semicolonOptional)
            js += ';';

        _.js += js;
    },

    VariableDeclarator: function generateVariableDeclarator($stmt, settings) {
        var $id = $stmt.id,
            $init = $stmt.init,
            genSettings = Settings.varDeclarator(settings.allowIn);

        if ($init) {
            ExprGen[$id.type]($id, genSettings);
            _.js += _.optSpace + '=' + _.optSpace;
            ExprGen[$init.type]($init, genSettings);
        }

        else {
            if ($id.type === Syntax.Identifier)
                _.js += $id.name;

            else
                ExprGen[$id.type]($id, genSettings);
        }
    },

    VariableDeclaration: function generateVariableDeclaration($stmt, settings) {
        var $decls = $stmt.declarations,
            len = $decls.length,
            prevIndent = len > 1 ? shiftIndent() : _.indent,
            declGenSettings = Settings.varDeclaration(settings.allowIn);

        _.js += $stmt.kind;

        for (var i = 0; i < len; i++) {
            var $decl = $decls[i];

            _.js += i === 0 ? _.space : (',' + _.optSpace);
            StmtGen[$decl.type]($decl, declGenSettings);
        }

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';

        _.indent = prevIndent;
    },

    ThrowStatement: function generateThrowStatement($stmt, settings) {
        var arg = source(generateExpression, $stmt.argument, Settings.throwStmtArg);

        _.js += joinWithSpacing('throw', arg);

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    TryStatement: function generateTryStatement($stmt) {
        var js = 'try' +
                 adoptionPrefix($stmt.block) +
                 source(generateStatement, $stmt.block, Settings.tryStmtBlock) +
                 adoptionSuffix($stmt.block);

        var handlers = $stmt.handlers || $stmt.guardedHandlers;

        if (handlers)
            js = generateTryStatementHandlers(js, $stmt.finalizer, handlers);

        if ($stmt.handler) {
            handlers = isArray($stmt.handler) ? $stmt.handler : [$stmt.handler];
            js = generateTryStatementHandlers(js, $stmt.finalizer, handlers);
        }

        if ($stmt.finalizer) {
            js = joinWithSpacing(js, 'finally' + adoptionPrefix($stmt.finalizer));
            js += source(generateStatement, $stmt.finalizer, Settings.tryStmtFinalizer);
        }

        _.js += js;
    },

    SwitchStatement: function generateSwitchStatement($stmt) {
        var $cases = $stmt.cases,
            $discr = $stmt.discriminant,
            prevIndent = shiftIndent();

        _.js += 'switch' + _.optSpace + '(';
        ExprGen[$discr.type]($discr, Settings.switchStmtDiscriminant);
        _.js += ')' + _.optSpace + '{' + _.newline;
        _.indent = prevIndent;

        if ($cases) {
            var caseCount = $cases.length,
                lastCaseIdx = caseCount - 1;

            for (var i = 0; i < caseCount; i++) {
                var $case = $cases[i];

                _.js += _.indent;
                StmtGen[$case.type]($case, Settings.switchStmtCase(i === lastCaseIdx));
                _.js += _.newline;
            }
        }

        _.js += _.indent + '}';
    },

    SwitchCase: function generateSwitchCase($stmt, settings) {
        var $conseqs = $stmt.consequent,
            $firstConseq = $conseqs[0],
            i = 0,
            prevIndent = shiftIndent(),
            conseqSemicolonOptional = !semicolons && settings.semicolonOptional,
            conseqCount = $conseqs.length,
            lastConseqIdx = conseqCount - 1;

        if ($stmt.test) {
            var test = source(generateExpression, $stmt.test, Settings.switchCaseTest);
            _.js += joinWithSpacing('case', test) + ':';
        }

        else
            _.js += 'default:';


        if (conseqCount && $firstConseq.type === Syntax.BlockStatement) {
            i++;
            _.js += adoptionPrefix($firstConseq);
            StmtGen[$firstConseq.type]($firstConseq, Settings.switchCaseConseqBlock);
        }

        for (; i < conseqCount; i++) {
            var $conseq = $conseqs[i],
                semicolonOptional = i === lastConseqIdx && conseqSemicolonOptional;

            _.js += _.newline + _.indent;
            StmtGen[$conseq.type]($conseq, Settings.switchCaseConseq(semicolonOptional));
        }

        _.indent = prevIndent;
    },

    IfStatement: function generateIfStatement($stmt, settings) {
        var $conseq = $stmt.consequent,
            $test = $stmt.test,
            prevIndent = shiftIndent(),
            semicolonOptional = !semicolons && settings.semicolonOptional;

        _.js += 'if' + _.optSpace + '(';
        ExprGen[$test.type]($test, Settings.ifStmtTest);
        _.js += ')';
        _.indent = prevIndent;
        _.js += adoptionPrefix($conseq);

        if ($stmt.alternate) {
            var conseq = source(generateStatement, $conseq, Settings.ifStmtConseqWithAlt) +
                         adoptionSuffix($conseq),
                alt = source(generateStatement, $stmt.alternate, Settings.ifStmtAlt(semicolonOptional));

            if ($stmt.alternate.type === Syntax.IfStatement)
                alt = 'else ' + alt;

            else
                alt = joinWithSpacing('else', adoptionPrefix($stmt.alternate) + alt);

            _.js += joinWithSpacing(conseq, alt);
        }

        else
            StmtGen[$conseq.type]($conseq, Settings.ifStmtConseq(semicolonOptional));
    },

    ForStatement: function generateForStatement($stmt, settings) {
        var $init = $stmt.init,
            $test = $stmt.test,
            $body = $stmt.body,
            $update = $stmt.update,
            bodySemicolonOptional = !semicolons && settings.semicolonOptional,
            prevIndent = shiftIndent();

        _.js += 'for' + _.optSpace + '(';

        if ($init) {
            if ($init.type === Syntax.VariableDeclaration)
                StmtGen[$init.type]($init, Settings.forStmtVarInit);

            else {
                ExprGen[$init.type]($init, Settings.forStmtInit);
                _.js += ';';
            }
        }

        else
            _.js += ';';

        if ($test) {
            _.js += _.optSpace;
            ExprGen[$test.type]($test, Settings.forStmtTest);
        }

        _.js += ';';

        if ($update) {
            _.js += _.optSpace;
            ExprGen[$update.type]($update, Settings.forStmtUpdate);
        }

        _.js += ')';
        _.indent = prevIndent;
        _.js += adoptionPrefix($body);
        StmtGen[$body.type]($body, Settings.forStmtBody(bodySemicolonOptional));
    },

    ForInStatement: function generateForInStatement($stmt, settings) {
        generateForStatementIterator('in', $stmt, settings);
    },

    ForOfStatement: function generateForOfStatement($stmt, settings) {
        generateForStatementIterator('of', $stmt, settings);
    },

    LabeledStatement: function generateLabeledStatement($stmt, settings) {
        var $body = $stmt.body,
            bodySemicolonOptional = !semicolons && settings.semicolonOptional,
            prevIndent = _.indent;

        _.js += $stmt.label.name + ':' + adoptionPrefix($body);

        if ($body.type !== Syntax.BlockStatement)
            prevIndent = shiftIndent();

        StmtGen[$body.type]($body, Settings.labeledStmtBody(bodySemicolonOptional));
        _.indent = prevIndent;
    },

    ModuleDeclaration: function generateModuleDeclaration($stmt, settings) {
        _.js += 'module' + _.space + $stmt.id.name + _.space +
                'from' + _.optSpace + generateLiteral($stmt.source);

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    Program: function generateProgram($stmt) {
        var $body = $stmt.body,
            len = $body.length,
            lastIdx = len - 1;

        if (safeConcatenation && len > 0)
            _.js += '\n';

        for (var i = 0; i < len; i++) {
            var $item = $body[i];

            _.js += _.indent;
            StmtGen[$item.type]($item, Settings.programBodyItem(!safeConcatenation && i === lastIdx));

            if (i !== lastIdx)
                _.js += _.newline;
        }
    },

    FunctionDeclaration: function generateFunctionDeclaration($stmt) {
        var isGenerator = !!$stmt.generator;

        _.js += isGenerator ? ('function*' + _.optSpace) : ('function' + _.space );
        _.js += $stmt.id.name;
        generateFunctionBody($stmt);
    },

    ReturnStatement: function generateReturnStatement($stmt, settings) {
        if ($stmt.argument) {
            var arg = source(generateExpression, $stmt.argument, Settings.returnStmtArg);

            _.js += joinWithSpacing('return', arg);
        }

        else
            _.js += 'return';

        if (semicolons || !settings.semicolonOptional)
            _.js += ';';
    },

    WhileStatement: function generateWhileStatement($stmt, settings) {
        var $body = $stmt.body,
            $test = $stmt.test,
            bodySemicolonOptional = !semicolons && settings.semicolonOptional,
            prevIndent = shiftIndent();

        _.js += 'while' + _.optSpace + '(';
        ExprGen[$test.type]($test, Settings.whileStmtTest);
        _.js += ')';
        _.indent = prevIndent;

        _.js += adoptionPrefix($body);
        StmtGen[$body.type]($body, Settings.whileStmtBody(bodySemicolonOptional));
    },

    WithStatement: function generateWithStatement($stmt, settings) {
        var $body = $stmt.body,
            $obj = $stmt.object,
            bodySemicolonOptional = !semicolons && settings.semicolonOptional,
            prevIndent = shiftIndent();

        _.js += 'with' + _.optSpace + '(';
        ExprGen[$obj.type]($obj, Settings.withStmtObj);
        _.js += ')';
        _.indent = prevIndent;
        _.js += adoptionPrefix($body);
        StmtGen[$body.type]($body, Settings.withStmtBody(bodySemicolonOptional));
    }
};

function generateStatement($stmt, option) {
    StmtGen[$stmt.type]($stmt, option);
}

//CodeGen
//-----------------------------------------------------------------------------------
function source(proc, $node, settings) {
    var savedJs = _.js;
    _.js = '';

    proc($node, settings);

    var src = _.js;
    _.js = savedJs;

    return src;
}


function expand(proc, $node, settings) {
    proc($node, settings);
}

function run($node) {
    _.js = '';

    if (StmtGen[$node.type])
        generateStatement($node, Settings.stmtInitial);

    else
        generateExpression($node, Settings.exprInitial);

    return _.js;
}

function wrapExprGen(gen) {
    return function ($expr, settings) {
        if (extra.verbatim && $expr.hasOwnProperty(extra.verbatim))
            generateVerbatim($expr, settings);

        else
            gen($expr, settings);
    }
}

function createExprGenWithExtras() {
    var gens = {};

    for (var key in ExprRawGen) {
        if (ExprRawGen.hasOwnProperty(key))
            gens[key] = wrapExprGen(ExprRawGen[key]);
    }

    return gens;
}

/**
 * Strings
 */

var _ = {
    js: '',
    newline: '\n',
    optSpace: ' ',
    space: ' ',
    indentUnit: '    ',
    indent: ''
};

/**
 * Generators
 */
var ExprGen = void 0,
    StmtGen = StmtRawGen;


function generate($node, options) {
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
        _.indentUnit = options.format.indent.style;
        if (typeof options.base === 'string') {
            _.indent = options.base;
        } else {
            _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
        }
    } else {
        options = defaultOptions;
        _.indentUnit = options.format.indent.style;
        _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
    }
    json = options.format.json;
    renumber = options.format.renumber;
    hexadecimal = json ? false : options.format.hexadecimal;
    quotes = json ? 'double' : options.format.quotes;
    escapeless = options.format.escapeless;

    _.newline = options.format.newline;
    _.optSpace = options.format.space;

    if (options.format.compact)
        _.newline = _.optSpace = _.indentUnit = _.indent = '';

    _.space = _.optSpace ? _.optSpace : ' ';
    parentheses = options.format.parentheses;
    semicolons = options.format.semicolons;
    safeConcatenation = options.format.safeConcatenation;
    directive = options.directive;
    parse = json ? null : options.parse;
    extra = options;

    if (extra.verbatim)
        ExprGen = createExprGenWithExtras();

    else
        ExprGen = ExprRawGen;

    return run($node);
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
