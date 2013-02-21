/*
 * Application logic
 */
var Logic = {
  parser: PEG.buildParser(" \
    start = logic* \
    logic = q:query a:action ' '* { return {query:Query.compile(q), action:CoffeeScript.eval('-> ' + a.trim().replace(/^\{/, '').replace(/\}$/, '')) } }  \
    query = q:[^{]+ { return q.join('').trim() } \
    action = block:curly { return block } \
    curly = curly:('{' ([^{}]+ / curly)+ '}') { return curly.flatten().join('') } \
  "),

  compile: function(logics) {
    return this.parser.parse(logics).map(function(logic) {
      logic.apply = function() {
        var entities = World.queryRaw(this.query);
        for (var i = 0; i < entities.length; i++)
          this.action.call(entities[i]);
      }

      return logic;
    });
  },

  store: [],
  
  add: function(logic_objects) {
    this.store = this.store.concat(logic_objects);
  },

  addFromString: function(logics) {
    this.add(this.compile(logics));
  },

  addFromFile: function(url) {
    (new XHConn()).connect(url, 'get', '', function(xhr) {
      Logic.addFromString(xhr.responseText.trim())
    });
  },

  runAll: function() {
    for (var i = 0; i < this.store.length; i++) {
      this.store[i].apply();
    };
  }
}

var scripts = document.querySelectorAll("script[type='text/logic']");
for (var i = 0; i < scripts.length; i++) {
  if(scripts[i].src.length > 0) Logic.addFromFile(scripts[i].src);
  Logic.addFromString( scripts[i].text.trim() )
};

window.onload = function() {
  Logic.runAll();
  setInterval(function(){Logic.runAll()}, 3);
}