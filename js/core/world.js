/*
 * Application state
 */

define(["core/peg", "core/query", "core/entity", "core/ajax", "core/math"], function(PEG, Query, Entity, Ajax) {
  function nestedObjects(str, val) {
    return str.split(".").reverse().reduce(function(m, f) { var h={}; h[f] = m; return h; }, val);
  }

  var World = {
    parser: PEG.buildParser(" \
      start = entity* \
      entity = (' ' / '\\n')* e:[^;\\n]+ (';' / '\\n' / !.) { return e.join('') } \
    "),

    compile: function(state_source) {
      return !state_source ? [{}] : World.parser.parse(state_source).map(function(queryString) {
        var predicates = []

        var ast = Query.parser.parse(queryString)[0]
        for (var i = 0; i < ast.length; i++) {
          if(ast[i].simple) {
            predicates.push( nestedObjects(ast[i].property, {}) )

          } else if(ast[i].infix) {
            switch(ast[i].infix) {
              case '=':
                predicates.push( nestedObjects(ast[i].property, ast[i].value) )
                break;
              case '!=':
                if(ast[i].value == undefined)
                  predicates.push( nestedObjects(ast[i].property, true) )
                break;
              default:
                console.warn("Ignoring unsupported infix operator '" + ast[i].infix + "' in World.compile")
            }

          } else if(ast[i].prefix) {
            switch(ast[i].prefix) {
              case '&':
                delete ast[i].prefix;
                ast[i].infix = "=";
                ast[i].value = ast[i].property;
                ast[i].property = "id";
                i--;
                break;
              default:
                console.warn("Ignoring unsupported prefix operator '" + ast[i].prefix + "' in World.compile")
            }

          } else if(ast[i].wildcard) {
            console.warn("Ignoring wildcard predicate in World.compile")

          }
        }

        return predicates.reduce(function(e, p) { return Object.merge(e, p, true); }, {});
      });
    },

    state: {},

    stateArray: [],

    newId: function() {
      return (Date.now() + Math.random()).toString(36)
    },

    add: function(state_source) {
      World.parser.parse(state_source).forEach(function(source) { World.spawn(source) });
    },

    load: function(file) {
      console.log("Loading state from %s...", file);
      (new Ajax()).connect(file, "GET", "", function(res) {
        World.add(res.response)
      })
    },

    removeEntity: function(entity) {
      World.remove(entity.id);
    },

    remove: function(id) {
      World.stateArray.needs_rebuild = true;
      delete World.state[id];
    },

    spawn: function(structure) {
      World.stateArray.needs_rebuild = true;

      var newEntity = new Entity(structure);

      World.state[newEntity.id] = newEntity;
      // this is an issue when spawned was never defined
      if(newEntity.spawned)
        newEntity.spawned()
      
      return newEntity;
    },

    rebuildStateArray: function() {
      World.stateArray = Object.keys(World.state).map(function(k) { return World.state[k] });
      World.stateArray.needs_rebuild = false;
    },

    query: function(expression) {
      var compiledQuery = Query.compile(expression)
      return compiledQuery.id_query ? [World.state[compiledQuery.id_query]] : World.queryRaw(compiledQuery);
    },

    queryFirst: function(expression) {
      var compiledQuery = Query.compile(expression)
      return World.state[compiledQuery.id_query] || World.queryRaw(compiledQuery)[0];
    },

    queryRaw: function(fn) {
      if(World.stateArray.needs_rebuild) World.rebuildStateArray();
      return World.stateArray.filter(fn)
    }
  }

  window.World = World
  window['$'] = World.queryFirst
  window['$$'] = World.query

  return World;
});