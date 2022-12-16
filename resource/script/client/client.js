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
    "dom/widgetUpdated": 'When a widget is updated in the DOM',
    "dom/localUpdated": 'When a local is updated in the DOM',
    "router/pre-pageRequest": 'Fired just before we submit a go request to the server',
    "router/post-linkClick": 'When a user clicks on a a link',
    "payloadProcessor/in-payload": 'After a payload is received',
    "payloadProcessor/fileNotFound": 'File not found from the server',
    "router/formsubmit": 'When a form is submitted',
};
//@ts-ignore
import BaseModule from './BaseModule.js';
var hmr = new BaseModule();
//@ts-ignore
import router from './router.js';
//@ts-ignore
import DOMManipulation from './dommanipulation.js';
//@ts-ignore
import Form from './form.js';
//@ts-ignore 
import svg from './svg.js';
const formI = Form.getInstance();
window.addEventListener("form-submit", formI.formSubmit, false);
//@ts-ignore
import payloadProcessor from './payloadProcessor.js';
import Log from './log.js';
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
var dommanipulationinstance;
var ivy;
var routerInstance;
var log;
class Ivy extends payloadProcessor {
    constructor() {
        super();
        dommanipulationinstance = DOMManipulation.getInstance();
        dommanipulationinstance.m(uiComponent.createStatusElement);
        log = Log.getInstance();
        socketInit().then(function (server) {
            //server.send(JSON.stringify({payload:{file:"/ui/fragment"}}));
            //console.log('f')
        });
        window.addEventListener("post-navigate", function (evt) {
            //socket({file:"/ui/fragment"});
            //router.updateRouter(evt.detail);
            //dommanipulationinstance._navigateCleanUpLinks();
            console.log(':: post-navigate', evt.detail);
        });
        window.addEventListener("fileNotFound", function (evt) {
            dommanipulationinstance.fileNotFound(evt.detail);
        });
        window.addEventListener("widgetUpdated", function (e) {
            if (e.detail.file == '/ui/widget/nav') {
                console.log('fixing links after loading nav');
                dommanipulationinstance._navigateCleanUpLinks(true);
            }
            console.table(e.detail);
            console.log(':: widget updated');
        });
        window.addEventListener("localUpdated", function (e) {
            console.log(':: local updated');
        });
    }
}
// so we get rid of TS type casting errors in the below function
var socketInitS = { server: null, failedCount: 0 };
export const socketInit = async () => {
    /**
     * 0	CONNECTING	Socket has been created. The connection is not yet open.
     * 1	OPEN	The connection is open and ready to communicate.
     * 2	CLOSING	The connection is in the process of closing.
     * 3	CLOSED	The connection is closed or couldn't be opened.
     */
    /*const a = await auth0Client.isAuthenticated();
  
    console.log(auth0Client)
    
    if (a !== true) {
      return
    }*/
    if (socketInitS.server && socketInitS.server.readyState < 2) {
        //console.log("reusing the socket connection [state = " + socketInitS.server.readyState + "]");
        return Promise.resolve(socketInitS.server);
    }
    return await new Promise(function (resolve, reject) {
        socketInitS.server = new WebSocket('ws://localhost:8082');
        log.count = false;
        log.last = true;
        console.warn('Connecting: attempt ' + socketInitS.failedCount);
        socketInitS.server.onopen = function () {
            socketInitS.failedCount = 0; // reset the connction counter
            resolve(socketInitS.server);
            const result = dommanipulationinstance;
            result.m(uiComponent.connected);
            console.warn('Connected!');
            log.count = true;
            log.last = false;
            socket({ url: "/widget/nav" });
        };
        socketInitS.server.onclose = function (reason) {
            socketInitS.failedCount++;
            dommanipulationinstance.m(uiComponent.disconnected);
            reject(socketInitS.server);
            //setTimeout(check, config.poll*socketInitS.failedCount);
            setTimeout(check, config.poll + 1000);
        };
        socketInitS.server.onerror = function (err) {
            dommanipulationinstance.m(uiComponent.disconnected);
            reject(socketInitS.server);
        };
        socketInitS.server.onmessage = async function (data) {
            const result = JSON.parse(data.data);
            const g = await ivy.message(result);
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
};
function socket(arg) {
    socketInit().then(function (server) {
        /**
         * wrap the standard 'payload' key around the data if it doesn't exist.
         * All socket comms in the framework is wrapped in a payload key
         */
        if (!arg.hasOwnProperty('payload')) {
            arg = { payload: arg };
        }
        // 'as any' is a hack to fix a typescript error from saying send doesn't exist on null
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
    disconnected: {},
    loggedin: {}
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
    ui: {
        node: {
            div: [
                {
                    attr: {
                        class: ["disconnected", "pulse", "status"],
                        id: "status"
                    },
                    verb: "add"
                }
            ]
        }
    }
};
uiComponent.connected = {
    ui: {
        node: {
            div: [
                {
                    attr: {
                        addClass: ["connected", "pulse", "status"],
                        removeClass: ["disconnected"],
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
    }
};
uiComponent.disconnected = {
    ui: {
        node: {
            div: [
                {
                    attr: {
                        addClass: ["disconnected", "pulse", "status"],
                        removeClass: ["connected"],
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
    }
};
uiComponent.loggedin = {
    ui: {
        node: {
            body: [
                {
                    attr: {
                        addClass: "loggedin",
                    },
                    verb: "update"
                }
            ],
        }
    }
};
const dom = new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve));
//Auth0Client, createAuth0Client
//with async/await
let auth0Client;
const client = async () => {
    auth0Client = await auth0.createAuth0Client({
        domain: 'dev-6mab7ukqbwl72vhr.uk.auth0.com',
        clientId: 'D1DWUcrpiBD8AUXJ4XpvdqJK4rjibnoO',
    });
};
/*
        let auth0Client = null;
        let auth0: any = {}
        const fetchAuthConfig = () => fetch("/ui/auth_config.json")
        const configureClient = async () => {
          
        
          const response = await fetchAuthConfig();
          const config = await response.json();
        
          auth0Client = await auth0.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId
          });
        
          const isAuthenticated = await auth0Client.isAuthenticated();
          //await auth0Client.loginWithPopup()
        }
        await configureClient();
        */
const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
};
const login = async () => {
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: 'http://localhost:8080'
        }
    });
};
const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
};
document.body.addEventListener('click', function (e) {
    const button = e.target;
    if (button.id == 'login') {
        login();
    }
    if (button.id == 'logout') {
        logout();
    }
});
await client();
dom.then(() => {
    console.log('DOM Loaded');
    c();
});
async function c() {
    //async function dom<T>(value: T): Promise<T> {
    ivy = new Ivy();
    const isAuthenticated = await auth0Client.isAuthenticated();
    const query = window.location.search;
    if (isAuthenticated === true) {
        userAuthenticated();
    }
    else {
        if (window.location.pathname != '/login' && !query.includes("code=")) {
            window.location.pathname = '/login';
        }
    }
    //await updateUI();
    //const isAuthenticated = await auth0Client.isAuthenticated();
    // console.log(await auth0Client.getTokenSilently());
    //if (isAuthenticated) {
    // show the gated content
    //console.log(await auth0Client.getUser());
    //return
    // }
    // NEW - check for the code and state parameters
    if (query.includes("code=") && query.includes("state=")) {
        // Process the login state
        await auth0Client.handleRedirectCallback();
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated === true) {
            userAuthenticated();
        }
        //updateUI();
        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
    else {
    }
    routerInstance = new router();
}
async function userAuthenticated() {
    dommanipulationinstance.m(uiComponent.loggedin);
    console.log(await auth0Client.isAuthenticated());
    console.log(await auth0Client.getUser());
}
export { registry, routerInstance as router, socket, config, hook };
