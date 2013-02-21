/*
 * Application state
 */
var World = {
  parser: PEG.buildParser(" \
    start = entity* \
    entity = (' ' / '\\n')* e:[^;\\n]+ (';' / '\\n' / !.) { return Query.parser.parse(e.join(''))[0] } \
  "),

  compile: function(state_source) {
    return World.parser.parse(state_source).map(function(predicates) {
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
    World.state = World.state.concat(World.compile(state_source));
  },

  remove: function(entity) {
    World.state.splice(World.state.indexOf(entity), 1)
  },

  clone: function(original) {
    var clone = World.spawn();
    for(var prop in original)
      clone[prop] = original[prop]
    return clone
  },

  spawn: function() {
    var newEntity = {};
    World.state.push(newEntity);
    return newEntity;
  },

  query: function(expression) {
    return World.state.filter(Query.compile(expression));
  },

  queryRaw: function(fn) {
    return World.state.filter(fn);
  }
}

var scripts = document.querySelectorAll("script[type='text/state']");
for (var i = 0; i < scripts.length; i++) {
  World.add( scripts[i].text.trim() )
};