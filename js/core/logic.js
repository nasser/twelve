// http://tech.karbassi.com/2009/12/17/pure-javascript-flatten-array/
Array.prototype.flatten = function flatten(){
   var flat = [];
   for (var i = 0, l = this.length; i < l; i++){
       var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
       if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten.call(this[i]) : this[i]); }
   }
   return flat;
};

/*
 * Application logic
 */
var Logic = {
  parser: PEG.buildParser(" \
    start = logic* \
    logic = q:query a:action ' '* { return {query:q, action:a} }  \
    query = q:[^{]+ { return Query.compile(q.join('').trim()) } \
    action = block:curly { return eval('(function()' + block + ')') } \
    curly = curly:('{' ([^{}]+ / curly)+ '}') { return curly.flatten().join('') } \
  "),

  compile: function(logics) {
    return this.parser.parse(logics).map(function(logic) {
      logic.apply = function() {
        var entities = World.queryRaw(logic.query);
        for (var i = 0; i < entities.length; i++)
          this.action.call(entities[i]);
      }

      return logic;
    });
  },

  store: [],
  
  add: function(logics) {
    this.store = this.store.concat(this.compile(logics));
  },

  runAll: function() {
    for (var i = 0; i < this.store.length; i++) {
      this.store[i].apply();
    };
  }
}

var scripts = document.querySelectorAll("script[type='text/logic']");
for (var i = 0; i < scripts.length; i++) {
  Logic.add( scripts[i].text.trim() )
};

window.onload = function() {
  Logic.runAll();
  setInterval(function(){Logic.runAll()}, 3);
}