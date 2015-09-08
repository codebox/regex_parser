function regex(parseTreeRootNode) {
    var matcherFunctions = [];

    function walkParseTree(node) {
        var buildMatcher = node.matched.buildMatcher;
        if (buildMatcher) {
            matcherFunctions.push(buildMatcher(node, matcherFunctions));
        } else {
            node.children.forEach(walkParseTree);
        }
    }
    walkParseTree(parseTreeRootNode);

    function makeMatchStateList(){
        var states = [];
        return {
            addMatchState : function(remainingText, capturedTextArray) {
                states.push({
                    remainingText : remainingText,
                    capturedTextArray : capturedTextArray
                })
            },
            forEachMatchState : function(fn) {
                states.forEach(fn);
            },
            size : function() {
                return states.length;
            },
            contains : function(value) {
                return states.some(function(matchState){
                    return matchState.remainingText === value;
                });
            }
        };
    }

    return {
        toString : function(){
            return node.toString();
        },
        match: function (remainingText) {
            var matchStates = makeMatchStateList();
            matchStates.addMatchState(remainingText, []);

            var allMatchersMatched = matcherFunctions.every(function (matcher) {
                var newMatchStates = makeMatchStateList();
                matchStates.forEachMatchState(function(matchState) {
                    var possibleMatches = matcher(matchState.remainingText, matchState.capturedTextArray);
                    (possibleMatches || []).forEach(function(match) {
                        var textToMatch = matchState.remainingText.substring(match.length);
                        var capturedTextArray = matchState.capturedTextArray;
                        if (matcher.isCapturingGroup) {
                            capturedTextArray = capturedTextArray.concat(match);
                        }
                        newMatchStates.addMatchState(textToMatch, capturedTextArray);
                    });
                });
                matchStates = newMatchStates;
                return matchStates.size() > 0;
            });
            var allTextMatched = matchStates.contains('');
            var matchSet = set();

            matchStates.forEachMatchState(function(matchState){
                matchSet.add(remainingText.substring(0, remainingText.length - matchState.remainingText.length))
            });

            return {
                matchSet : matchSet,
                allTextMatched : allTextMatched,
                allMatchersMatched : allMatchersMatched
            };
        }
    };
}