var handlers = (function () {
    var UNLIMITED = {};

    function buildAlternativesMatcher(node, matcherFunctions) {
        var terms = findChildrenOfType(node, 'TERM');
        var regexes = terms.map(function(term){
            return regex(term);
        });

        return function (txt) {
            var matches = set();
            regexes.forEach(function(regex){
                var m = regex.match(txt);
                m.matchSet.values().forEach(function(value){
                    matches.add(value);
                });
            });
            return matches.values();
        };
    }

    function buildParensMatcher(node, matcherFunctions) {
        var innerRegex = regex(findChildrenOfType(node, 'REGEX')[0]);

        var matcher = function (txt) {
            return innerRegex.match(txt).matchSet.values();
        };
        matcher.isCapturingGroup = true;
        return matcher;
    }

    function buildBackRefHandler(node, matcherFunctions) {
        var digit = findChildrenOfType(node, 'DIGIT')[0];
        var index = Number(digit.text);

        return function (txt, groups) {
            var value = groups[index-1];
            if (value !== undefined) {
                var l = value.length;
                if (txt.substring(0, l) == value){
                    return [value];    
                }                
            } else {
                throw 'Unknown group: \\' + index
            }
        };
    }

    function findMatchesForMultiples(txt, matcher, minTimes, maxTimes) {
        var range = (function () {
            return {
                includesValue: function (n) {
                    if (maxTimes === UNLIMITED) {
                        return n >= minTimes;
                    }
                    return n <= maxTimes && n >= minTimes;
                },
                valueTooLarge: function (n) {
                    return maxTimes === UNLIMITED ? false : n > maxTimes;
                }
            };
        }());

        var allResults = set();
        if (range.includesValue(0)) {
            allResults.add('');
        }

        function matchMultipleTimes(remainingText, previousMatch, n) {
            if (range.valueTooLarge(n)) {
                return;
            }
            var matchesForN = [];
            var matches = matcher(remainingText);

            (matches || []).forEach(function (match) {
                matchesForN.push(previousMatch + match);
            });

            if (range.includesValue(n)) {
                matchesForN.forEach(function (matchForN) {
                    allResults.add(matchForN);
                });
            }

            (matchesForN || []).forEach(function (matchForN) {
                var remainingTxt = txt.substring(matchForN.length);
                if (remainingTxt) {
                    matchMultipleTimes(remainingTxt, matchForN, n + 1);
                }
            });
        }

        matchMultipleTimes(txt, '', 1);

        return allResults.values();
    }

    function buildZeroOrMoreMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();

        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, 0, UNLIMITED);
        };
    }

    function buildZeroOrOneMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();

        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, 0, 1);
        };
    }

    function buildOneOrMoreMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();

        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, 1, UNLIMITED);
        };
    }

    function buildNumberOfMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();
        var numberNode = findChildrenOfType(node, 'NUMBER')[0];
        var count = Number(numberNode.text);

        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, count, count);
        };
    }

    function buildNumberOrMoreOfMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();
        var numberNode = findChildrenOfType(node, 'NUMBER')[0];
        var count = Number(numberNode.text);

        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, count, UNLIMITED);
        };
    }

    function buildNumberRangeOfMatcher(node, matcherFunctions) {
        var previousMatcher = matcherFunctions.pop();
        var numberNodes = findChildrenOfType(node, 'NUMBER');
        var fromNumber = Number(numberNodes[0].text);
        var toNumber = Number(numberNodes[1].text);

        if (toNumber < fromNumber) {
            throw Error('Invalid regex, numbers in wrong order in {}')
        }
        return function (txt) {
            return findMatchesForMultiples(txt, previousMatcher, fromNumber, toNumber);
        };
    }

    function buildDotMatcher(node) {
        return function (txt) {
            if (txt.length) {
                return [txt[0]];
            }
        };
    }

    function findChildrenOfType(node, typeName) {
        var matches = [];

        function search(n) {
            if (n.matched.name !== typeName) {
                n.children.forEach(function (c) {
                    search(c);
                });
            } else {
                matches.push(n);
            }
        }

        search(node);

        return matches;
    }

    function buildInclusiveCharListMatcher(node) {
        var charSpecNodes = findChildrenOfType(node, 'CHAR_SPEC');
        var matchers = charSpecNodes.map(function (charSpecNode) {
            var firstChild = charSpecNode.children[0];
            return firstChild.matched.buildMatcher(firstChild);
        });

        return function (txt) {
            if (!txt){
                return;
            }
            var c = txt[0];
            var atLeastOneMatch = matchers.some(function (m) {
                return m(c);
            });
            if (atLeastOneMatch) {
                return [c];
            }
        }
    }

    function buildExclusiveCharListMatcher(node) {
        var inclusiveCharListMatcher = buildInclusiveCharListMatcher(node);
        return function (txt) {
            if (!txt){
                return;
            }

            var c = txt[0];
            if (!inclusiveCharListMatcher(txt)) {
                return [c];
            }
        };
    }

    function buildRangeMatcher(node) {
        var startChar = node.children[0].text;
        var endChar = node.children[2].text;

        return function (txt) {
            if (!txt){
                return;
            }

            var c = txt[0];
            if (c >= startChar && c <= endChar) {
                return [c];
            }
        }
    }

    function buildLiteralMatcher(node) {
        var matchedChar = node.text;

        return function (txt) {
            if (txt[0] === matchedChar) {
                return [matchedChar];
            }
        }
    }

    function not(fn){
        return function(c){
            return ! fn(c);
        };
    }

    function buildCharCheckHandlerBuilder(fn){
        return function charCheckHandlerBuilder(){
            return function charCheckHandler(txt) {
                var c = txt[0];
                if (fn(c)) {
                    return [c];
                }
            }
        }
    }

    var isWhitespace = (function(){
        var whitespaceChars = '\u0009\u000A\u000B\u000C\u000D\u0020\u0085\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000';
        return function(c) {
            return whitespaceChars.indexOf(c) >= 0;
        };
    }());

    var buildWhitespaceHandler    = buildCharCheckHandlerBuilder(isWhitespace);
    var buildNonWhitespaceHandler = buildCharCheckHandlerBuilder(not(isWhitespace));

    function makeCharInRangeFn(min, max){
        return function(c){
            return c >= min && c <= max;
        };
    }

    var isDigit = makeCharInRangeFn('0', '9');

    var buildDigitAliasHandler    = buildCharCheckHandlerBuilder(isDigit);
    var buildNonDigitAliasHandler = buildCharCheckHandlerBuilder(not(isDigit));

    var isUppercaseLetter = makeCharInRangeFn('A', 'Z');
    var isLowercaseLetter = makeCharInRangeFn('a', 'z');

    function isWordChar(c){
        return isDigit(c) || isUppercaseLetter(c) || isLowercaseLetter(c) || c === '_';
    }

    var buildWordCharHandler    = buildCharCheckHandlerBuilder(isWordChar);
    var buildNonWordCharHandler = buildCharCheckHandlerBuilder(not(isWordChar));

    var matcherBuilders = {
        "ZERO_OR_MORE": buildZeroOrMoreMatcher,
        "ALTERNATIVES": buildAlternativesMatcher,
        "ZERO_OR_ONE": buildZeroOrOneMatcher,
        "ONE_OR_MORE": buildOneOrMoreMatcher,
        "NUMBER_OF": buildNumberOfMatcher,
        "NUMBER_OR_MORE_OF": buildNumberOrMoreOfMatcher,
        "NUMBER_RANGE_OF": buildNumberRangeOfMatcher,
        "DOT": buildDotMatcher,
        "INCLUSIVE_CHAR_LIST": buildInclusiveCharListMatcher,
        "EXCLUSIVE_CHAR_LIST": buildExclusiveCharListMatcher,
        "RANGE": buildRangeMatcher,
        "NON_META_CHAR": buildLiteralMatcher,
        "NON_META_CHAR_LIST": buildLiteralMatcher,
        "PARENS" : buildParensMatcher,
        "BACKREF" : buildBackRefHandler,
        "WHITESPACE" : buildWhitespaceHandler,
        "NON_WHITESPACE" : buildNonWhitespaceHandler,
        "DIGIT_ALIAS" : buildDigitAliasHandler,
        "NON_DIGIT_ALIAS" : buildNonDigitAliasHandler,
        "WORD_CHAR" : buildWordCharHandler,
        "NON_WORD_CHAR" : buildNonWordCharHandler
    }

    return {
        'apply': function (grammar) {
            var productionRules = grammar.productionRules;
            productionRules.forEach(function (nonTerminal) {
                var matcherBuilder = matcherBuilders[nonTerminal.name];
                if (matcherBuilder) {
                    nonTerminal.buildMatcher = matcherBuilder;
                }
            });
        }
    };
}());
