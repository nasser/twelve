/* 
 * Entity filter
 */
var Query = {
  parser: PEG.buildParser(" \
    start = predicate* \
    \
    predicate = prefix_predicate / infix_predicate / simple_predicate \
    prefix_predicate = operator:operator property:alpha white { return { property:property, prefix:operator} } \
    infix_predicate  = property:alpha operator:operator value:value white { return { property:property, infix:operator, value:value } }\
    simple_predicate = property:alpha white { return { property:property, infix:'!=', value:undefined } } \
    \
    operator = '=' / '!' / '<' / '>' / '!=' / '<=' / '>=' / '~' \
    \
    value = string / literal \
    number = d:[0-9]+ { return parseFloat(d.join('')) } \
    literal = l:[^ ]+ { return eval(l.join('')) } \
    string = '\"' s:[^\"]+ '\"' { return '\"' + s.join('') + '\"' } \
    \
    alpha = a:[a-zA-Z_]+ { return a.join('') } \
    white = ' '* \
  "),

  compile: function(query) {
    var ast = this.parser.parse(query);
    var code = [];

    for (var i = 0; i < ast.length; i++) {
      var predicate = ast[i];

      if(predicate.prefix) {
        switch(predicate.prefix) {
          case '!': code.push ('e["' + predicate.property + '"]===undefined'); break;
          default: console.warn("Ignoring unsupported prefix operator '" + predicate.prefix + "' in query '" + query + "'");
        }

      } else if(predicate.infix) {
        switch(predicate.infix) {
          case '=': code.push( 'e["' + predicate.property + '"]===' + predicate.value ); break;
          default: code.push( 'e["' + predicate.property + '"]' + predicate.infix + predicate.value ); break;
        }
      }

    };

    return eval("(function(e){return " + code.join(" && ") + "})");
  }
}