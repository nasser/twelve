require(["core/world", "core/sugar"], function(World) {
  function objectToTable (obj) {
    var html = "<table>";

    for(var prop in obj) {
      if(typeof obj[prop] === 'object') {
        // html += "<tr><th>" + prop + "</th>"
        // html += objectToTable(obj[prop])

        html += "<tr><th>" + prop + "</th><td>" + objectToTable(obj[prop]) + "</td>"
      } else {
        html += "<tr><th>" + prop + "</th><td>" + obj[prop] + "</td></tr>"
      }
    }

    return html + "</table>"
  }

  var Inspector = document.createElement("div")
  Inspector.setAttribute("id", "inspector")

  Inspector.innerHTML += "<input type='search' placeholder='Entity Query'><div class='entities'>";
  var tablesContainer = Inspector.querySelector('.entities');

  var searchBox = Inspector.querySelector("input[type='search']")
  searchBox.onchange = function(e) {
    var entities = World.query(searchBox.value);
    var tables = tablesContainer.querySelectorAll("table")
    for (var i = tables.length - 1; i >= 0; i--) {
      tablesContainer.removeChild(tables[i]);
    }

    for (var i = 0; i < entities.length; i++) {
      var tableHTML = "<table>"
      var tagsHTML = ""
      var idHTML = ""
      var simplePropsHTML = ""
      var objectPropsHTML = ""

      for(var prop in entities[i]) {
        if(typeof entities[i][prop] == 'function')
          continue;

        if(typeof entities[i][prop] === 'object') {
          if(Object.size(entities[i][prop]) == 0) {
            tagsHTML += "<span>" + prop + "</span>";
          } else {
            // objectPropsHTML += "<tr><th>" + prop + "</th></tr>"
            // objectPropsHTML += objectToTable(entities[i][prop])
            objectPropsHTML += "<tr><th>" + prop + "</th><td>" + objectToTable(entities[i][prop]) + "</td></tr>"
          }
        } else {
          if(prop == "id") {
            idHTML += "<tr><th class='id' colspan=2>" + entities[i][prop] + "</th></tr>"
          } else {
            simplePropsHTML += "<tr><th>" + prop + "</th><td>" + entities[i][prop] + "</td></tr>"
          }
        }
      }

      tableHTML += idHTML;
      tableHTML += "<tr><td colspan=2 class='tags'>" + tagsHTML  + "</td></tr>"
      tableHTML += simplePropsHTML;
      tableHTML += objectPropsHTML;

      tablesContainer.innerHTML += tableHTML;
    }

    var tables = tablesContainer.querySelectorAll('table');
    for (var i = tables.length - 1; i >= 0; i--) {
      tables[i].onmouseover = function(e) {
        var id = this.querySelector('.id').innerHTML;
        World.state[id].addTag('debug')
      }

      tables[i].onmouseout = function(e) {
        var id = this.querySelector('.id').innerHTML;
        World.state[id].removeTag('debug')
      }
    };
  }

  document.querySelector("style").innerHTML += "#inspector { width: 300px; position: fixed; background: white; padding: 0.5em; opacity: 0.95; top: 0; right: 0; }"
  document.querySelector("style").innerHTML += "#inspector input[type='search'] { width: 100%; }"

  document.querySelector("style").innerHTML += "#inspector .entities { overflow: scroll; max-height: 600px; }"
  document.querySelector("style").innerHTML += "#inspector table { margin-bottom: 1em; font-size: 8pt; }"
  document.querySelector("style").innerHTML += "#inspector table th { text-align: right; vertical-align: top; }"
  document.querySelector("style").innerHTML += "#inspector table .tags span { padding: 3px; margin: 1px; border-radius: 5px; background: #bbb; color: white; }"

  document.body.appendChild(Inspector);
});