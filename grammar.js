var grammar = (function () {
    var PRODUCTION_RULES_TXT = [
		'REGEX				 : ^ START $',
		'REGEX				 : START',
		'REGEX				 : ^ START',
		'REGEX				 : START $',
		'START				 : TERM',
		'START				 : ALTERNATIVES',
		'ALTERNATIVES		 : TERM | START',
        "TERM                : FACTOR TERM",
        "TERM                :",
        "FACTOR              : BASE MULTIPLIERS",
        "BASE                : CHAR",
        "BASE                : DOT",
        "BASE                : PARENS",
        "BASE                : BACKREF",
        "PARENS              : ( REGEX )",
        "MULTIPLIERS         : MULTIPLIER MULTIPLIERS",
        "MULTIPLIERS         :",
        "MULTIPLIER          : ZERO_OR_MORE",
        "MULTIPLIER          : ZERO_OR_ONE",
        "MULTIPLIER          : ONE_OR_MORE",
        "MULTIPLIER          : NUMBER_OF",
        "MULTIPLIER          : NUMBER_OR_MORE_OF",
        "MULTIPLIER          : NUMBER_RANGE_OF",
        "ZERO_OR_MORE        : *",
        "ZERO_OR_ONE         : ?",
        "ONE_OR_MORE         : +",
        "NUMBER_OF           : { NUMBER }",
        "NUMBER_OR_MORE_OF   : { NUMBER , }",
        "NUMBER_RANGE_OF     : { NUMBER , NUMBER }",
        "DOT                 : .",
        "CHAR                : NON_META_CHAR",
        "CHAR                : DIGIT",
        "CHAR                : WHITESPACE",
        "CHAR                : NON_WHITESPACE",
        "CHAR                : DIGIT_ALIAS",
        "CHAR                : NON_DIGIT_ALIAS",
        "CHAR                : WORD_CHAR",
        "CHAR                : NON_WORD_CHAR",
        "CHAR                : INCLUSIVE_CHAR_LIST",
        "CHAR                : EXCLUSIVE_CHAR_LIST",
        "INCLUSIVE_CHAR_LIST : [ CHAR_SPEC CHAR_SPECS ]",
        "EXCLUSIVE_CHAR_LIST : [ ^ CHAR_SPEC CHAR_SPECS ]",
        "CHAR_SPEC           : NON_META_CHAR_LIST",
        "CHAR_SPEC           : RANGE",
        "RANGE               : NON_META_CHAR_LIST - NON_META_CHAR_LIST",
        "CHAR_SPECS          : CHAR_SPEC CHAR_SPECS",
        "CHAR_SPECS          : ",
        "NON_META_CHAR       : ~^{}[]().|*+?\\$",
        "NON_META_CHAR_LIST  : ~^]",
        "DIGIT               : 1234567890",
        "DIGITS              : DIGIT DIGITS",
        "DIGITS              :",
        "NUMBER              : DIGIT DIGITS",
        "BACKREF             : \\ DIGIT",
        "WHITESPACE          : \\ s",
        "NON_WHITESPACE      : \\ S",
        "DIGIT_ALIAS         : \\ d",
        "NON_DIGIT_ALIAS     : \\ D",
        "WORD_CHAR           : \\ w",
        "NON_WORD_CHAR       : \\ W"
    ];

    var productionRuleMap = {};
    PRODUCTION_RULES_TXT.forEach(function (productionRuleText) {
        var parts = productionRuleText.split(':', 2).map(function (s) {
            return s.trim();
        });
        var nonTerminalName = parts[0];
        var production = parts[1];

        if (!(nonTerminalName in productionRuleMap)) {
            productionRuleMap[nonTerminalName] = [];
        }
        productionRuleMap[nonTerminalName].push(production);
    });

    function makeNonTerminal(name) {
        return {
            isTerminal: false,
            name: name,
            toString: function () {
                return name;
            }
        };
    }

    function makeTerminal(text) {
        var notPrefix = (text[0] == '~');
        if (notPrefix) {
            text = text.substring(1);
        }
        return {
            isTerminal: true,
            matches: function (c) {
                if (!c){
                    return false;
                }
                var charIsInList = text.indexOf(c) > -1;
                return charIsInList ^ notPrefix;
            },
            toString: function () {
                return (notPrefix ? 'not one of: ' : '') + '"' + text + '"';
            }
        };
    }

    function makeEpsilon() {
        return {
            isTerminal: true,
            isEpsilon: true,
            matches: function () {
                return true;
            },
            toString: function () {
                return '<epsilon>';
            }
        };
    }

    var productionRules = (function () {
        var nameMap = {};
        return {
            nameMap : nameMap,
            'get': function (name) {
                return nameMap[name];
            },
            'put': function (name) {
                if (!nameMap[name]) {
                    nameMap[name] = makeNonTerminal(name);
                }
            },
            'forEach': function (fn) {
                Object.keys(nameMap).forEach(function (name) {
                    fn(nameMap[name], name);
                });
            },
            'toString': function () {
                var result = [];
                this.forEach(function (nt) {
                    result.push(nt.name + ': ' + nt.mappings.map(function (nt) {
                            return nt.toString();
                        }).join(', '));
                });
                return result.join('\n');
            }
        };
    }());

    // Create empty non-terminals for each key productionRuleMap
    Object.keys(productionRuleMap).forEach(function (name) {
        productionRules.put(name);
    });

    function identity(x) {
        return x;
    }

    // Add mappings to each of the productionRules by reading the values in productionRuleMap
    productionRules.forEach(function (nonTerminal) {
        nonTerminal.mappings = productionRuleMap[nonTerminal.name].map(function (productionTxt) {
            return productionTxt.split(' ').map(function (txt) {
                if (txt) {
                    var nonTerminal = productionRules.get(txt);
                    if (nonTerminal) {
                        return nonTerminal;
                    } else {
                        return makeTerminal(txt);
                    }
                } else {
                    return makeEpsilon();
                }
            });
        });
    });

    return {
        'startSymbolName': 'REGEX',
        'productionRules': productionRules
    };
}());

