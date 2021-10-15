'use strict';

var config = {
    poll: 2000,
    dev: true  
};

var dom: object = {};




//@ts-ignore
import BaseModule from './BaseModule.js';
var hmr = new BaseModule();

//@ts-ignore
import router from './router.js';
var routerInstance = new router();

//@ts-ignore
import DOMManipulation from './dommanipulation.js';


//@ts-ignore 
import svg from './svg.js';

new svg();

var ivyDOM: any;
var devHandlerInstance: any;
var dommanipulationinstance: any;    


var ivyui = {
  s: function(){ 
  
    ivyDOM = new initDOM();
    dommanipulationinstance = DOMManipulation.getInstance();

    devHandlerInstance = new devHandler();
    devHandlerInstance.createStatusElement();

    //connectSocket();

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    return;
  }
}

var socket = null;


socket = connectSocket().then(function(server) {
  return this;
}).catch(function(err) {
  // error here
});


function connectSocket() {



    return new Promise(function(resolve, reject) {
    //function start () {
        var server = new WebSocket('ws://localhost:8082');

        server.onopen = function(){
            resolve(server);
            devHandlerInstance.connected();
        };
        
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/

        server.send = function(content) {
            console.log(content);
        }

        server.onmessage = function(data){
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

        server.onclose = function(reason){
            devHandlerInstance.disconnected();
            
            // need to see if reason exists. If it does, check for the code.
            // I think this is to do if the connection exists, or it it just closed. 
            // I needed to do this because it would poll forever and crash the browser.
            if (reason && reason.code == 1006) {
                check();
            }
            
        };
  
        server.onerror = function(err) {
            reject(err);
            devHandlerInstance.disconnected();
        };
    //}
  
    /*
    function check() {
        if(socket === null || socket.readyState === WebSocket.CLOSED) {
            start();
        }
    }
    
    start();
    setInterval(check, config.poll);
    */
  });
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
class devHandler extends DOMManipulation {

    public constructor () {
        super();
        var json = {
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
    
        //super.m(json);
    }

    public createStatusElement () {

        var json = {
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
        
        super.m(json);
    }

    public connected () {
        var json = {
            ui:{
              node:{
                div:[
                  {
                    attr: {
                      addclass: ["connected","pulse"],
                      id: "status"
                    },
                    verb:"update"
                  }
                ],
                body:[
                    {
                      attr: {
                        addclass: "connected",
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
    
        super.m(json);
    }

    public disconnected () {
        var json = {
            "ui":{
            "node":{
                "div":[
                {
                    "attr": {
                    removeclass: ["connected","pulse"],
                    "id": "status"
                    },
                    "verb":"update"
                }
                ],
                "body":[
                    {
                      "attr": {
                        "removeclass": "connected",
                      },
                      "verb":"update"
                    }
                  ]
                }
            },
            "data": {
                "status": "Lost connection"
            }
        };

        super.m(json);
    }
}

export { socket, routerInstance as router}; 

document.addEventListener("DOMContentLoaded", ivyui.s);