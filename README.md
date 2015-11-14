# regex_parser
This is a regular expression parser, written in JavaScript as a learning exercise - if you need to parse a regular expression in JavaScript you should of course use the built-in [RegExp class](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions), and not this implementation.

This library implements a backtracking [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser) and uses [this grammar](https://github.com/codebox/regex_parser/blob/master/grammar.js) to construct a parse tree from the regular expression text that you supply. The parse tree is encapsulated within a regex object, and returned by the `parse.compile()` function. The regex object exposes a `match()` method that can be used to test string values against the expression. The result of a match is contained within an object that has a `matches` property, set to either `true` or `false` to indicate whether the match succeeded or not.

<pre>var regex, match;
regex = parser.compile('abc+');
match = regex.match('abccc'); // match.matches = true
match = regex.match('abcd');  // match.matches = false
</pre>

The library supports the following symbols:

<table>

<tbody>

<tr>

<th>Symbol</th>

<th>Example</th>

</tr>

<tr>

<td>* (zero or more)</td>

<td>abc*</td>

</tr>

<tr>

<td>+ (one or more)</td>

<td>abc+</td>

</tr>

<tr>

<td>? (zero or one)</td>

<td>abc?</td>

</tr>

<tr>

<td>. (any single character)</td>

<td>a.b.c</td>

</tr>

<tr>

<td>[ ] (inclusive character specification)</td>

<td>[A-C][a-c][123]</td>

</tr>

<tr>

<td>[^ ] (exclusive character specification)</td>

<td>[^A-C][^a-c][^123]</td>

</tr>

<tr>

<td>{ } (exact number of matches)</td>

<td>a{5}</td>

</tr>

<tr>

<td>{ , } (range of matches)</td>

<td>a{3,5}</td>

</tr>

<tr>

<td>{ ,} (lower bounded number of matches)</td>

<td>a{3,}</td>

</tr>

<tr>

<td>| (alternatives)</td>

<td>dog|cat|hamster</td>

</tr>

<tr>

<td>() (parentheses)</td>

<td>d(i|u|o)g</td>

</tr>

<tr>

<td>() \1 (capturing groups)</td>

<td>(1|2|3)==\1</td>

</tr>

<tr>

<td>\s and \S (whitespace/non-whitespace alias)</td>

<td>\S\s\S\s\S</td>

</tr>

<tr>

<td>\d and \D (digit/non-digit alias)</td>

<td>\d\D\d</td>

</tr>

</tbody>

</table>

You can try some live examples on the [project homepage](http://codebox.org.uk/pages/regex-parser) 
