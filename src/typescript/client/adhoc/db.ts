//@ts-ignore
import { registry, socket } from "../client.js";
import DOMManipulation from "../dommanipulation.js";





//var controller = router.registry.controller;

const dommanipulationinstance = DOMManipulation.getInstance();


const db = {
    me: function () {

//window.addEventListener("post-navigate", function(evt: object){
    //console.warn(evt.detail);


  //});

    }
}
window.removeEventListener("in-payload", test);
window.addEventListener("in-payload", test);

function test(evt) {
  if ("db" in evt.detail) {} else {return;}

  //console.table(registry);
  if (registry.controller != "interface") return;

  socket({file:"/resource/template/widget/cassandra.html"});
  
  
  var html = {
    "ui":{
      "node":{
        "div":[
          {
            "attr": {
              "class": "cassandra",
              "id": "cassandra"
            },
            "verb":"upsert"
          }
        ]
      }
    },
    "data": {
        "cassandra": JSON.stringify(evt.detail)
    }
  };
  dommanipulationinstance.m(html);
//console.log(evt.detail.db);
  dommanipulationinstance.DOMData = evt.detail;
}
db.me();
export default db