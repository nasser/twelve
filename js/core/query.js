/* 
 * Entity filter
 */

var PEG = require("./peg.js")

var Query = {
  parser: PEG.buildParser(" \
    start = first:single_query rest:additional_query* { return [first].concat(rest) } \
    \
    single_query = p:predicate* comment? { return p } \
    additional_query = ',' white q:single_query { return q } \
    \
    predicate = wildcard_predicate / infix_predicate / prefix_predicate / simple_predicate \
    wildcard_predicate = comment? '*' white { return { wildcard: true } } \
    prefix_predicate = comment? operator:operator property:alpha white { return { property:property, prefix:operator} } \
    infix_predicate  = comment? property:alpha operator:operator value:value white { return { property:property, infix:operator, value:value } }\
    simple_predicate = comment? property:alpha white { return { property:property, simple:true } } \
    comment = '/*' (!'*/' .)* '*/' white / ('//'/'#') [^\\n]* '\\n' white \
    \
    operator = '=' / '!' / '<' / '>' / '!=' / '<=' / '>=' / '~' \
    \
    value = string / literal \
    number = d:[0-9]+ { return parseFloat(d.join('')) } \
    literal = l:[^, ]+ { return eval(l.join('')) } \
    string = string_dq / string_sq \
    string_dq = '\"' s:[^\"]+ '\"' { return s.join('') } \
    string_sq = \"'\" s:[^\']+ \"'\" { return s.join('') } \
    \
    alpha = a:[a-zA-Z_\.]+ { return a.join('') } \
    white = [\\n  ]* \
  "),
  
  cache: {},

  compile: function(query_string) {
    if(this.cache[query_string] === undefined) {
      var ast = this.parser.parse(query_string);
      var specificity = 0;

      var final_code = [];

      for (var i = 0; i < ast.length; i++) {
        var query = ast[i];
        var query_code = [];

        for(var j = 0; j<query.length; j++) {
          var predicate = query[j];

          if(predicate.wildcard) {
            query_code = ['true'];
            break;

          } else if(predicate.simple) {
            query_code.push('e["' + predicate.property + '"]!==undefined');

          } else if(predicate.prefix) {
            switch(predicate.prefix) {
              case '!': query_code.push ('e["' + predicate.property + '"]===undefined'); break;
              default: console.warn("Ignoring unsupported prefix operator '" + predicate.prefix + "' in query '" + query + "'");
            }

          } else if(predicate.infix) {
            switch(predicate.infix) {
              case '=': query_code.push( 'e["' + predicate.property + '"]===' + (typeof predicate.value == 'string' ? '"' + predicate.value + '"' : predicate.value) ); break;
              default: query_code.push( 'e["' + predicate.property + '"]' + predicate.infix + predicate.value ); break;
            }
          }
          
        }

        specificity += query_code.length;
        final_code.push("(" + query_code.join(" && ") + ")");
      };

      var queryFunction = eval("(function(e){return " + final_code.join(" || ") + "})");
      queryFunction.specificity = specificity;
      queryFunction.query = query_string;
      // queryFunction.toString = function() { return query_string };


      this.cache[query_string] = queryFunction;
    }

    return this.cache[query_string];
  }
}

module.exports = Query