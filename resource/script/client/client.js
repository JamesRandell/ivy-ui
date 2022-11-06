'use strict';
var registry = {
    controller: "index",
    action: "index",
    id: null,
    args: []
};
var config = {
    poll: 2000,
    dev: true,
    basePath: ''
};
// contains a list of registered hooks
var hook = {
    "dom/pre-pageRequest": 'Triggered a navigation event (successfull page request)',
    "router/pre-pageRequest": 'Fired just before we submit a go request to the server',
    "router/post-linkClick": 'When a user clicks on a a link',
    "socketRouter/in-payload": 'After a payload is received'
};
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
import hotModuleReload from './socketRouter.js';
var data = {
    "db": {
        "datacenter": "datacenter1",
        "host": [
            {
                "status": "Unknown status",
                "state": "Unknown state",
                "load": "16",
                "owns": "100.0%",
                "hostID": "541a3a6c-c20d-4a5a-8c81-53a432e1069a",
                "rack": "rack1"
            }
        ]
    }
};
//const v = template.parse(html, data, );
const q = document.querySelector('footer');
console.log(q);
//q.innerHTML = template.compile(v, data);
var dommanipulationinstance;
var ivyui;
class ivy extends hotModuleReload {
    constructor() {
        super();
        dommanipulationinstance = DOMManipulation.getInstance();
        dommanipulationinstance.m(uiComponent.createStatusElement);
        socketInit().then(function (server) {
            //server.send(JSON.stringify({payload:{file:"/ui/fragment"}}));
            //console.log('f')
        });
        window.addEventListener("post-navigate", function (evt) {
            //socket({file:"/ui/fragment"});
            dommanipulationinstance._navigateCleanUpLinks();
        });
    }
}
// so we get rid of TS type casting errors in the below function
var socketInitS = { server: null, failedCount: 0 };
function socketInit() {
    /**
     * 0	CONNECTING	Socket has been created. The connection is not yet open.
     * 1	OPEN	The connection is open and ready to communicate.
     * 2	CLOSING	The connection is in the process of closing.
     * 3	CLOSED	The connection is closed or couldn't be opened.
     */
    if (socketInitS.server && socketInitS.server.readyState < 2) {
        //console.log("reusing the socket connection [state = " + socketInitS.server.readyState + "]");
        return Promise.resolve(socketInitS.server);
    }
    return new Promise(function (resolve, reject) {
        socketInitS.server = new WebSocket('ws://localhost:8082');
        socketInitS.server.onopen = function () {
            socketInitS.failedCount = 0; // reset the connction counter
            resolve(socketInitS.server);
            dommanipulationinstance.m(uiComponent.connected);
            socket({ file: "/widget/nav" });
        };
        socketInitS.server.onclose = function (reason) {
            socketInitS.failedCount++;
            dommanipulationinstance.m(uiComponent.disconnected);
            reject(socketInitS.server);
            //setTimeout(check, config.poll*socketInitS.failedCount);
            setTimeout(check, config.poll);
        };
        socketInitS.server.onerror = function (err) {
            dommanipulationinstance.m(uiComponent.disconnected);
            reject(socketInitS.server);
        };
        socketInitS.server.onmessage = function (data) {
            const result = JSON.parse(data.data);
            console.log('msg received');
            ivyui.message(result);
            const svgInstance = new svg(dommanipulationinstance);
        };
        function check() {
            if (socketInitS.server && socketInitS.server.readyState === 3) {
                socketInit();
            }
        }
        socketInit();
        //setInterval(check, config.poll*socketInitS.failedCount);
    }).catch((e) => {
        //console.error("Could not connect to socket server");
    });
}
function socket(arg) {
    socketInit().then(function (server) {
        /**
         * wrap the standard 'payload' key around the data if it doesn't exist.
         * All socket comms in the framework is wrapped in a payload key
         */
        if (!arg.hasOwnProperty('payload')) {
            arg = { payload: arg };
        }
        server.send(JSON.stringify(arg));
    }).catch(function (err) {
        console.log(err);
    });
}
//document.addEventListener('click', e => {
//const button = e.target as Element;
//button.closest('button');
//routerInstance.request('bringMeTheDOM');
//routerInstance.go('index.html');
//})
/**
 * This is going to be a development handler for socket comms.
 * At the start it will build JSON payloads for my DOM class to build things like
 * the console, status (connected etc), change background-color and so on.
 *
 * It's intended use is to trial the JSON payload feature, and hopefully not cross-contaminate
 * my classes with functionality
 */
var uiComponent = {
    btn: {},
    createStatusElement: {},
    connected: {},
    disconnected: {}
};
uiComponent.btn = {
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
uiComponent.createStatusElement = {
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
uiComponent.connected = {
    ui: {
        node: {
            div: [
                {
                    attr: {
                        class: "connected pulse status",
                        id: "status"
                    },
                    verb: "update"
                }
            ],
            body: [
                {
                    attr: {
                        addClass: "connected",
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
uiComponent.disconnected = {
    ui: {
        node: {
            div: [
                {
                    attr: {
                        class: "disconnected pulse status",
                        id: "status"
                    },
                    verb: "update"
                }
            ],
            body: [
                {
                    attr: {
                        removeClass: "connected",
                    },
                    verb: "update"
                }
            ]
        }
    },
    data: {
        status: ""
    }
};
document.addEventListener("DOMContentLoaded", () => {
    ivyui = new ivy();
});
var routerInstance = new router();
export { registry, socketInit, socket, routerInstance as router, config, hook };
