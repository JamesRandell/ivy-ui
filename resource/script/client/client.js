'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var config = {
    poll: 2000,
    dev: true,
    basePath: '/ui'
};
var dom = {};
socketInit();
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
var ivyDOM;
var devHandlerInstance;
var dommanipulationinstance;
var ivyui = {
    s: function () {
        ivyDOM = new initDOM();
        dommanipulationinstance = DOMManipulation.getInstance();
        devHandlerInstance = new devHandler();
        devHandlerInstance.createStatusElement();
        //socket = connectSocket();
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        return;
    }
};
//var async so = null;
var so = (arg) => __awaiter(void 0, void 0, void 0, function* () { return null; });
function socketInit() {
    console.log('pre so');
    if (so)
        return so;
    console.log('post so');
    return so = new Promise((resolve, reject) => {
        let ws = new WebSocket('ws://localhost:8082');
        console.log('in return');
        ws.onopen = function () {
            resolve(ws);
            console.log(so);
            devHandlerInstance.connected();
        };
        ws.onclose = function (reason) {
            devHandlerInstance.disconnected();
            reject(ws);
        };
        ws.onerror = function (err) {
            devHandlerInstance.disconnected();
            reject(ws);
        };
        ws.onmessage = function (data) {
            const result = JSON.parse(data.data);
            dommanipulationinstance.message(result);
        };
    });
}
//async function socket(arg) {
const socket = (arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(so);
        console.log(123);
        var quote = yield socketInit();
        quote.send(JSON.stringify(arg));
        console.log('Sending to server: ', JSON.stringify(arg));
    }
    catch (error) {
        console.error('Error in socket: ', error);
    }
});
function connectSocketBUP() {
    //return new Promise(function(resolve, reject) {
    function start() {
        let ws = new WebSocket('ws://localhost:8082');
        ws.onopen = function () {
            //resolve(server);
            devHandlerInstance.connected();
            console.log(9);
        };
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/
        ws.send = function (content) {
            console.log(content);
        };
        ws.onmessage = function (data) {
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
        ws.onclose = function (reason) {
            devHandlerInstance.disconnected();
            // need to see if reason exists. If it does, check for the code.
            // I think this is to do if the connection exists, or it it just closed. 
            // I needed to do this because it would poll forever and crash the browser.
            if (reason && reason.code == 1006) {
                check();
            }
        };
        ws.onerror = function (err) {
            //reject(err);
            devHandlerInstance.disconnected();
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
function check() { }
//document.addEventListener('click', e => {
//const button = e.target as Element;
//button.closest('button');
//routerInstance.request('bringMeTheDOM');
//routerInstance.go('index.html');
//})
class initDOM {
    constructor() {
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.createConsole();
    }
    createConsole() {
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
    constructor() {
        super();
        var json = {
            "ui": {
                "node": {
                    "button": [
                        {
                            "attr": {
                                "id": "btn"
                            },
                            "verb": "add"
                        }
                    ],
                    "div": [
                        {
                            "attr": {
                                "class": ""
                            },
                            "verb": "add"
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
    createStatusElement() {
        var json = {
            "ui": {
                "node": {
                    "div": [
                        {
                            "attr": {
                                "class": "status",
                                "id": "status"
                            },
                            "verb": "add"
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
    connected() {
        var json = {
            ui: {
                node: {
                    div: [
                        {
                            attr: {
                                addclass: ["connected", "pulse"],
                                id: "status"
                            },
                            verb: "update"
                        }
                    ],
                    body: [
                        {
                            attr: {
                                addclass: "connected",
                            },
                            verb: "update"
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
    disconnected() {
        var json = {
            "ui": {
                "node": {
                    "div": [
                        {
                            "attr": {
                                removeclass: ["connected", "pulse"],
                                "id": "status"
                            },
                            "verb": "update"
                        }
                    ],
                    "body": [
                        {
                            "attr": {
                                "removeclass": "connected",
                            },
                            "verb": "update"
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
document.addEventListener("DOMContentLoaded", ivyui.s);
export { so, socket, routerInstance as router, config };
