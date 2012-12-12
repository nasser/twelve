/*
 * Application state
 */
var World = {
  parser: PEG.buildParser(" \
    start = entity* \
    entity = ' '* e:[^;\\n]+ (';' / '\\n' / !.) { return Query.parser.parse(e.join(''))[0] } \
  "),

  compile: function(state_source) {
    return this.parser.parse(state_source).map(function(predicates) {
      var entity = {}

      predicates.forEach(function(predicate) {
        if(predicate.simple) {
          entity[predicate.property] = true;

        } else if(predicate.infix) {
          switch(predicate.infix) {
            case '=': entity[predicate.property] = predicate.value; break;
            case '!=': if(predicate.value == undefined) entity[predicate.property] = true; break;
            default: console.warn("Ignoring unsupported infix operator '" + predicate.infix + "' in entity")
          }

        } else if(predicate.prefix) {
          console.warn("Ignoring unsupported prefix operator '" + predicate.prefix + "' in entity")

        }
      });

      return entity;
    });
  },

  state: [],

  add: function(state_source) {
    this.state = this.state.concat(this.compile(state_source));
  },

  remove: function(entity) {
    this.state.splice(this.state.indexOf(entity), 1)
  },

  createEntity: function() {
    var newEntity = {};
    this.state.push(newEntity);
    return newEntity;
  },

  query: function(expression) {
    return this.state.filter(Query.compile(expression));
  },

  queryRaw: function(fn) {
    return this.state.filter(fn);
  }
}

var scripts = document.querySelectorAll("script[type='text/state']");
for (var i = 0; i < scripts.length; i++) {
  World.add( scripts[i].text.trim() )
};