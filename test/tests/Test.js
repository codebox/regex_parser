describe("Test", function () {

    function testRegex(regexText, text, expectedResult, allTextMatched = true) {
        let textArray;
        if (Array.isArray(text)) {
            textArray = text;
        } else {
            textArray = [text];
        }
        const regex = parser.compile(regexText);

        textArray.forEach(function (txt) {
            const match = regex.match(txt);
            expect( allTextMatched ? match.matches : match.allMatchersMatched).toBe(expectedResult);
        });
    }

    describe("Start End", function () {
        describe("Matches", function () {
			it("Both", function () {
				testRegex('^ab$', ['ab'], true);
			});
			it("Start", function () {
				testRegex('^ab', ['ab', 'abc'], true, false);
			});
			it("End", function () {
				testRegex('ab$', ['ab'], true);
				testRegex('.*ab$', ['cab'], true);
			});
        });
        describe("Mismatches", function () {
			it("Both", function () {
				testRegex('^ab$', ['a', 'b', 'ac', 'd'], false);
			});
			it("Start", function () {
				testRegex('^ab', ['a', 'b', 'ac', 'bc'], false);
			});
			it("End", function () {
				testRegex('ab$', ['acb', 'a', 'ba'], false);
				testRegex('.*ab$', ['caxb'], false);
			});
        });
    });

    describe("Literals", function () {
        describe("Matches", function () {
            it("empty string", function () {
                testRegex('', '', true);
            });
            it("single character", function () {
                testRegex('a', 'a', true);
            });
            it("multiple characters", function () {
                testRegex('abc', 'abc', true);
            });
        });
        describe("Mismatches", function () {
            it("empty string", function () {
                testRegex('', 'a', false);
            });
            it("single character", function () {
                testRegex('a', ['x', '', 'aa'], false);
            });
            it("multiple characters", function () {
                testRegex('abc', ['abcd', 'ab', 'Abc'], false);
                testRegex('zabc', 'abc', false);
            });
        });
    });

    describe("Dot", function () {
        describe("Matches", function () {
            it("single dot", function () {
                testRegex('.', ['a', '.'], true);
                testRegex('a.', 'ax', true);
                testRegex('.b', 'xb', true);
            });
            it("multiple dots", function () {
                testRegex('..', 'ab', true);
                testRegex('.x.x.', 'xxxxx', true);
            });
        });
        describe("Mismatches", function () {
            it("single dot", function () {
                testRegex('.', '', false);
                testRegex('a.', 'a', false);
                testRegex('.a', 'a', false);
            });
            it("multiple dots", function () {
                testRegex('..', 'abc', false);
                testRegex('a.b.c', 'abc', false);
            });
        });
    });

    describe("Inclusive Character Specifications", function () {
        describe("Matches", function () {
            it("literals", function () {
                testRegex('[a]', 'a', true);
                testRegex('[aaa]', 'a', true);
                testRegex('[abc]', ['a', 'b', 'c'], true);
            });
            it("ranges", function () {
                testRegex('[a-a]', 'a', true);
                testRegex('[a-b]', 'a', true);
                testRegex('[a-b]', 'b', true);
                testRegex('[a-z]', 'q', true);
                testRegex('[a-cx-z]', ['a', 'b', 'c', 'x', 'y', 'z'], true);
            });
            it("combinations", function () {
                testRegex('[ag-imv-xz]', ['a', 'g', 'h', 'i', 'm', 'v', 'w', 'x', 'z'], true);
            });
            it("multiples", function () {
                testRegex('[a]b[c-f]', ['abc', 'abd', 'abe', 'abf'], true);
            });
            it("meta-characters", function () {
                testRegex('[-+]', ['+', '-'], true);
                testRegex('[\-\+\\\\]', ['+', '-','\\'], true);
            });
        });
        describe("Mismatches", function () {
            it("literals", function () {
                testRegex('[a]', 'b', false);
                testRegex('[aaa]', 'b', false);
                testRegex('[abc]', 'd', false);
            });
            it("ranges", function () {
                testRegex('[a-a]', 'b', false);
                testRegex('[a-b]', 'B', false);
                testRegex('[a-cx-z]', 'd', false);
            });
            it("combinations", function () {
                testRegex('[ag-imv-xz]', ['b', 'f', 'j', 'l', 'n', 'u', 'y'], false);
            });
        });
    });

    describe("Exclusive Character Specifications", function () {
        describe("Matches", function () {
            it("literals", function () {
                testRegex('[^a]', 'b', true);
                testRegex('[^aaa]', 'b', true);
                testRegex('[^abc]', 'd', true);
            });
            it("ranges", function () {
                testRegex('[^a-a]', 'b', true);
                testRegex('[^a-b]', 'B', true);
                testRegex('[^a-cx-z]', 'd', true);
            });
            it("combinations", function () {
                testRegex('[^ag-imv-xz]', ['b', 'f', 'j', 'l', 'n', 'u', 'y'], true);
            });
        });
        describe("Mismatches", function () {
            it("literals", function () {
                testRegex('[^a]', 'a', false);
                testRegex('[^aaa]', 'a', false);
                testRegex('[^abc]', ['a', 'b', 'c'], false);
            });
            it("ranges", function () {
                testRegex('[^a-a]', 'a', false);
                testRegex('[^a-b]', 'a', false);
                testRegex('[^a-b]', 'b', false);
                testRegex('[^a-z]', 'q', false);
                testRegex('[^a-cx-z]', ['a', 'b', 'c', 'x', 'y', 'z'], false);
            });
            it("combinations", function () {
                testRegex('[^ag-imv-xz]', ['a', 'g', 'h', 'i', 'm', 'v', 'w', 'x', 'z'], false);
            });
            it("multiples", function () {
                testRegex('[^a]b[c-f]', ['abc', 'abd', 'abe', 'abf'], false);
                testRegex('[a]b[^c-f]', ['abc', 'abd', 'abe', 'abf'], false);
            });
        });
    });

    describe("test", function() {
        it("Matches", function () {
            testRegex('[a-c]*', '', true);
        })
    })

    describe("Exact Number Of", function () {
        it("Matches", function () {
            testRegex('a{0}', '', true);
            testRegex('a{1}', 'a', true);
            testRegex('a{3}', 'aaa', true);
            testRegex('.{2}', 'ab', true);
            testRegex('[abc]{2}', ['aa', 'bc', 'cc'], true);
        });
        it("Mismatches", function () {
            testRegex('a{0}', 'a', false);
            testRegex('a{1}', ['', 'aa', 'b', 'ab', 'ba'], false);
            testRegex('a{3}', ['', 'a', 'aa', 'aaaa', 'aba'], false);
            testRegex('.{2}', 'abc', false);
            testRegex('.{2}', 'a', false);
            testRegex('[abc]{2}', 'ad', false);
        });
    });

    describe("Number Range Of", function () {
        it("Matches", function () {
            testRegex('a{0,0}', '', true);
            testRegex('.{3,3}', 'abc', true);
            testRegex('a{0,2}', '', true);
            testRegex('[abc]{2,5}', ['ab', 'cca', 'abca', 'cccca'], true);
        });
        it("Mismatches", function () {
            testRegex('a{0,0}', 'a', false);
            testRegex('.{3,3}', ['ab', 'aaaa'], false);
            testRegex('a{0,2}', 'aaa', false);
            testRegex('[abc]{2,5}', ['a', 'aaabbb', 'ax', 'xbc'], false);
        });
    });

    describe("Number Or More Of", function () {
        it("Matches", function () {
            testRegex('a{0,}', ['', 'a', 'aaa'], true);
            testRegex('a{1,}', ['a', 'aa'], true);
            testRegex('a{3,}', ['aaa', 'aaaaaaaa'], true);
            testRegex('.{2,}', ['ab', 'xx', 'abc'], true);
            testRegex('[abc]{2,}', ['aa', 'bc', 'cc', 'aaa', 'bbcc'], true);
        });
        it("Mismatches", function () {
            testRegex('a{1,}', ['', 'b', 'ab', 'ba'], false);
            testRegex('a{3,}', ['', 'a', 'aa', 'aab', 'baaa'], false);
            testRegex('.{2,}', ['', 'a'], false);
            testRegex('[abc]{2,}', ['a', 'ad', 'dabc'], false);
        });
    });

    describe("Zero Or More", function () {
        it("Matches", function () {
            testRegex('a*', ['', 'a', 'aa', 'aaa'], true);
            testRegex('[a-c]*', ['', 'a', 'b', 'c', 'ab', 'ccc', 'bcabca'], true);
        });
        it("Mismatches", function () {
            testRegex('a*', ['b', 'aaab', 'baaa'], false);
            testRegex('[a-c]*', ['d', 'abcd'], false);
        });
    });

    describe("One Or More", function () {
        it("Matches", function () {
            testRegex('a+', ['a', 'aa', 'aaa'], true);
            testRegex('[a-c]+', ['a', 'b', 'c', 'ab', 'ccc', 'bcabca'], true);
        });
        it("Mismatches", function () {
            testRegex('a+', ['', 'aab', 'aabaa'], false);
            testRegex('[a-c]+', ['', 'd', 'aaad', 'bcadbca'], false);
        });
    });

    describe("Zero Or One", function () {
        it("Matches", function () {
            testRegex('a?', ['', 'a'], true);
            testRegex('[a-c]?', ['', 'a', 'b', 'c'], true);
        });
        it("Mismatches", function () {
            testRegex('a?', ['b', 'aa'], false);
            testRegex('[a-c]?', ['d', 'aa', 'abc'], false);
        });
    });

    describe("Combinations", function () {
        it("Matches", function () {
            testRegex('a[b-d]{3,5}e{2,}f?g*h+', ['abcdeefgh', 'abbbbbeeeeeh', 'adddeefgggghhhh'], true);
        });
        it("Mismatches", function () {
            testRegex('a[b-d]{3,5}e{2,}f?g*h+', ['bbbeefgh', 'abbeeh', 'abbbeh', 'abcdeef'], false);
        });
    });

    describe("Alternatives", function () {
        it("Matches", function () {
            testRegex('a|b', ['a', 'b'], true);
            testRegex('a||b', ['', 'a', 'b'], true);
            testRegex('a+|b+', ['a', 'aaa', 'b', 'bb'], true);
            testRegex('a*|b*|c*', ['', 'a', 'aaa', 'b', 'bb', 'c', 'cccc'], true);
        });
        it("Mismatches", function () {
            testRegex('a|b', ['', 'c', 'aa', 'ab'], false);
        });
    });

    describe("Brackets", function () {
        it("Matches", function () {
            testRegex('(a)', 'a', true);
            testRegex('(ab)*', ['', 'ab', 'ababab'], true);
            testRegex('(ab|cd)*', ['', 'ab', 'ababab', 'cd', 'cdcd', 'abcdababcdab'], true);
            testRegex('(ab(c|d)+e)*', ['abce', 'abde', 'abcde', 'abccddcce'], true);
        });
        it("Mismatches", function () {
            testRegex('(a)', ['', 'aa', 'b', '(a)'], false);
            testRegex('(ab)*', ['a', 'b', 'aba', 'abbb'], false);
            testRegex('(ab|cd)*', ['a', 'b', 'c', 'd', 'ac', 'abd'], false);
            testRegex('(ab(c|d)+e)*', ['abe', 'abcd'], false);
        });
    });

    describe("Capturing Groups", function () {
        it("Matches", function () {
            testRegex('(a)=\\1', 'a=a', true);
            testRegex('(a)\\1\\1b', 'aaab', true);
            testRegex('(a)(b)(c) \\1\\2\\3', 'abc abc', true);
            testRegex('(a)(b)(c) \\3\\2\\1', 'abc cba', true);
            testRegex('(a|b)\\1', ['aa', 'bb'], true);
            testRegex('(.)\\1', ['aa', 'bb', 'cc'], true);
            testRegex('(a*)\\1', ['', 'aa', 'aaaa'], true);
            testRegex('(a+)\\1', ['aa', 'aaaa'], true);
            testRegex('(A+) (B+) \\1 \\2', ['A B A B', 'AAA BB AAA BB'], true);
        });
        it("Mismatches", function () {
            testRegex('(a)\\1', ['', 'ab', 'a', 'a\\1', 'aaa'], false);
            testRegex('(a|b)\\1', ['ab', 'ba'], false);
            testRegex('(.)\\1', ['', 'a'], false);
            testRegex('(a*)\\1', ['a', 'aaa', 'aaaaa'], false);
            testRegex('(a+)\\1', ['', 'a', 'aaa'], false);
            testRegex('(A+) (B+) \\1 \\2', ['A B AA B', 'AAA BB AAA B'], false);
        });
    });

    describe("Whitespace", function () {
        it("Matches", function () {
            testRegex('\\s', ' ', true);
            testRegex('\\s+', ' \t\r\n\f', true);
            testRegex('\\s*', '', true);
        });
        it("Mismatches", function () {
            testRegex('\\s', ['', 'a', '\\s', '  '], false);
        });
    });

    describe("Non-Whitespace", function () {
        it("Matches", function () {
            testRegex('\\S', 'a', true);
        });
        it("Mismatches", function () {
            testRegex('\\S', [' ', '\n', '\t', '\r', '\f'], false);
        });
    });  

    describe("Digit Alias", function () {
        it("Matches", function () {
            testRegex('\\d', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], true);
        });
        it("Mismatches", function () {
            testRegex('\\d', ['00', 'a', '.', ' '], false);
        });
    });  

    describe("Non-Digit Alias", function () {
        it("Matches", function () {
            testRegex('\\D', ['a', '.', ' '], true);            
        });
        it("Mismatches", function () {
            testRegex('\\D', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], false);
        });
    });

    function expectError(regexText, consumed){
        expect(function(){
                parser.compile(regexText)
            }).toThrow('Unable to parse regex, consumed "' + consumed + '"')
    }

    describe("Invalid Regexes", function(){
        it("Throw Errors", function(){
            expectError('*', '');
            expectError('abc[]', 'abc');
            expectError('abc[xyz', 'abc');
            expectError('+++', '');
            expectError('a(', 'a');
            expectError('abc[^]', 'abc');
            expectError('a{z}', 'a');
            expectError('a{1,x}', 'a');
        })
    });
});
