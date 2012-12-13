/* 
 * Entity filter
 */
var Query = {
  parser: PEG.buildParser(" \
    start = first:single_query rest:additional_query* { return [first].concat(rest) } \
    \
    single_query = p:predicate* comment? { return p } \
    additional_query = ',' white q:single_query { return q } \
    \
    predicate = infix_predicate / prefix_predicate / simple_predicate \
    prefix_predicate = comment? operator:operator property:alpha white { return { property:property, prefix:operator} } \
    infix_predicate  = comment? property:alpha operator:operator value:value white { return { property:property, infix:operator, value:value } }\
    simple_predicate = comment? property:alpha white { return { property:property, simple:true } } \
    comment = '/*' (!'*/' .)* '*/' white / '//' [^\\n]* '\\n' white \
    \
    operator = '=' / '!' / '<' / '>' / '!=' / '<=' / '>=' / '~' \
    \
    value = string / literal \
    number = d:[0-9]+ { return parseFloat(d.join('')) } \
    literal = l:[^, ]+ { return eval(l.join('')) } \
    string = '\"' s:[^\"]+ '\"' { return '\"' + s.join('') + '\"' } \
    \
    alpha = a:[a-zA-Z_]+ { return a.join('') } \
    white = [\\n  ]* \
  "),
  
  cache: {},

  compile: function(query_string) {
    if(this.cache[query_string] === undefined) {
      var ast = this.parser.parse(query_string);

      var final_code = [];

      for (var i = 0; i < ast.length; i++) {
        var query = ast[i];
        var query_code = [];

        for(var j = 0; j<query.length; j++) {
          var predicate = query[j];

          if(predicate.simple) {
            query_code.push('e["' + predicate.property + '"]!==undefined');

          } else if(predicate.prefix) {
            switch(predicate.prefix) {
              case '!': query_code.push ('e["' + predicate.property + '"]===undefined'); break;
              default: console.warn("Ignoring unsupported prefix operator '" + predicate.prefix + "' in query '" + query + "'");
            }

          } else if(predicate.infix) {
            switch(predicate.infix) {
              case '=': query_code.push( 'e["' + predicate.property + '"]===' + predicate.value ); break;
              default: query_code.push( 'e["' + predicate.property + '"]' + predicate.infix + predicate.value ); break;
            }
          }
          
        }

        final_code.push("(" + query_code.join(" && ") + ")");
      };

      this.cache[query_string] = eval("(function(e){return " + final_code.join(" || ") + "})");
    }

    return this.cache[query_string];
  }
}