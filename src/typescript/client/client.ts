'use strict';

var config = {
    poll: 2000,
    dev: true,
    basePath: ''
};

var dom: object = {};
//socketInit();



//@ts-ignore
import BaseModule from './BaseModule.js';
var hmr = new BaseModule();

//@ts-ignore
import router from './router.js';


//@ts-ignore
import DOMManipulation from './dommanipulation.js';


//@ts-ignore 
import svg from './svg.js';

//@ts-ignore 
import polyfill from './polyfill.js';



var ivyDOM: any;
var dommanipulationinstance: any;    


var ivyui = {
  s: function(){ 
  
    ivyDOM = new initDOM();
    dommanipulationinstance = DOMManipulation.getInstance();

    new svg(dommanipulationinstance);

    dommanipulationinstance.m(uiComponent.createStatusElement);


    socketInit();//socket = connectSocket();


    window.addEventListener("post-navigate", function(evt){
      console.log('i have navigated');
      socket({file:"/ui/fragment"});

    });


    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    return;
  }
}



// so we get rid of TS type casting errors in the below function
var socketInitS = {server:null};

function socketInit () {
  
  
  if (socketInitS.server && socketInitS.server.readyState < 2) {
    //console.log("reusing the socket connection [state = " + socketInitS.server.readyState + "]");
    return Promise.resolve(socketInitS.server);
  }

  return new Promise(function(resolve, reject) {
    socketInitS.server = new WebSocket('ws://localhost:8082');

    socketInitS.server.onopen = function(){
      resolve(socketInitS.server);
      dommanipulationinstance.m(uiComponent.connected);
    };

    socketInitS.server.onclose = function(reason){
      dommanipulationinstance.m(uiComponent.disconnected);
      reject(socketInitS.server);
    };

    socketInitS.server.onerror = function(err) {
      dommanipulationinstance.m(uiComponent.disconnected);
      reject(socketInitS.server);
    };

    socketInitS.server.onmessage = function(data){
      const result = JSON.parse(data.data);
      dommanipulationinstance.message(result);
    };

  });
}
function socket (arg) {
  socketInit().then(function(server) {

    if (!arg.hasOwnProperty('payload')) {
      arg = {payload: arg};
    }
    server.send(JSON.stringify(arg));
}).catch(function(err) {
    console.log(err);
});
}

function connectSocketBUP() {



    //return new Promise(function(resolve, reject) {
    function start () {
        let ws = new WebSocket('ws://localhost:8082');

        ws.onopen = function(){
            //resolve(server);
            dommanipulationinstance.m(uiComponent.connected);
            console.log(9);
        };
        
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/

        ws.send = function(content) {
            console.log(content);
        }

        ws.onmessage = function(data){
            //try {
                const result = JSON.parse(data.data);

                //const key = Object.keys(data.data)[0];

                dommanipulationinstance.message(result);
            /*} catch (e) {
               console.log(e);
            
            }*/

        };
        // Listen for messages
        /*socket.addEventListener('message', function (e) {
            console.log('Message from server: ', e.data);
            
        });*/

        ws.onclose = function(reason){
          dommanipulationinstance.m(uiComponent.disconnected);
            
            // need to see if reason exists. If it does, check for the code.
            // I think this is to do if the connection exists, or it it just closed. 
            // I needed to do this because it would poll forever and crash the browser.
            if (reason && reason.code == 1006) {
                check();
            }
            
        };
  
        ws.onerror = function(err) {
            //reject(err);
            dommanipulationinstance.m(uiComponent.disconnected);
        };
    }
  
    
    function check() {
        //if(ws === null){ // || socket.readyState === WebSocket.CLOSED) {
        //    start();
        //}
    }
    
    start();
    setInterval(check, config.poll);
    
  //});
}
function check () {}

//document.addEventListener('click', e => {
    //const button = e.target as Element;
    //button.closest('button');
    //routerInstance.request('bringMeTheDOM');
    //routerInstance.go('index.html');
//})




class initDOM {

    console:    any;
    consoleWrapper: any;
    status;
    head = document.head || document.getElementsByTagName('head')[0];

    constructor() {
        this.createConsole();
    }

    createConsole () {
        this.console = document.createElement("div");

        this.consoleWrapper = document.createElement("section");
        this.consoleWrapper.setAttribute('class', 'console');

        this.consoleWrapper.appendChild(this.console);
        //document.body.appendChild(this.consoleWrapper);
    }


   
}

/*
(function(){
    var oldLog = console.log;
    console.log = function (message) {
        const g = JSON.stringify(message);
        ivyDOM.insert(g, 'console');
        oldLog.apply(console, arguments);

        ivyDOM.consoleWrapper.scrollTop = ivyDOM.consoleWrapper.scrollHeight;
        
    };
})();
*/

/*
window.console = {
    log : function(msg) {
        ivyDOM.insert(msg, 'console');
    },
    info : function(msg) {
        ivyDOM.insert(msg, 'console');
    },
    warn : function(msg) {
        ivyDOM.insert(msg, 'console');
    },

  }
  */


/**
 * This is going to be a development handler for socket comms.
 * At the start it will build JSON payloads for my DOM class to build things like
 * the console, status (connected etc), change background-color and so on.
 * 
 * It's intended use is to trial the JSON payload feature, and hopefully not cross-contaminate
 * my classes with functionality
 */
var uiComponent = {
  btn:{},
  createStatusElement:{},
  connected:{},
  disconnected:{}
};
uiComponent.btn = {
            "ui":{
              "node":{
                "button":[
                  {
                    "attr": {
                      "id": "btn"
                    },
                    "verb":"add"
                  }
                ],
                "div":[
                  {
                    "attr": {
                      "class":""
                    },
                    "verb":"add"
                  }
                ]
              }
            },
            "data": {
                "btn": "Click me"
            }
        };

uiComponent.createStatusElement = {
                "ui":{
                  "node":{
                    "div":[
                      {
                        "attr": {
                          "class": "status",
                          "id": "status"
                        },
                        "verb":"add"
                      }
                    ]
                  }
                },
                "data": {
                    "status": "DOM Loaded"
                }
            };

uiComponent.connected = {
            ui:{
              node:{
                div:[
                  {
                    attr: {
                      addClass: ["connected","pulse"],
                      id: "status"
                    },
                    verb:"update"
                  }
                ],
                body:[
                    {
                      attr: {
                        addClass: "connected",
                      },
                      verb:"update"
                    }
                  ],
              }
            },
            data: {
                status: ""
            }
        };
    
uiComponent.disconnected = {
            ui:{
            node:{
                div:[
                {
                    attr: {
                      removeClass: ["connected","pulse"],
                      id: "status"
                    },
                    verb:"update"
                }
                ],
                body:[
                    {
                      attr: {
                        removeClass: "connected",
                      },
                      verb:"update"
                    }
                  ]
                }
            },
            data: {
                status: "Lost connection"
            }
        };



document.addEventListener("DOMContentLoaded", ivyui.s);

var routerInstance = new router();

export { socketInit, socket, routerInstance as router, config}; 

