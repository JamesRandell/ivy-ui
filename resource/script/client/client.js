'use strict';
var config = {
    poll: 2000
};
document.addEventListener("DOMContentLoaded", ivyui);
//@ts-ignore
import BaseModule from '/resource/script/client/BaseModule.js';
var hmr = new BaseModule();
//@ts-ignore
import DOMManipulation from '/resource/script/client/dommanipulation.js';
var dommanipulationInstance = new DOMManipulation();
var dom;
function ivyui() {
    dom = new ivyDOM();
    connectSocket();
    dom.updateConnectionStatus('DOM Loaded');
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    console.log(params);
}
var socket = null;
function connectSocket() {
    'use strict';
    function start() {
        socket = new WebSocket('ws://localhost:8081');
        socket.onopen = function () {
            console.log('connected!!');
            dom.updateConnectionStatus('Connected!!');
            dom.changeBGColor(1);
        };
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/
        socket.onmessage = function (data) {
            //try {
            const result = JSON.parse(data.data);
            const key = Object.keys(data.data)[0];
            dommanipulationInstance.payload(Object.keys(result)[0], result);
            /*} catch (e) {
               console.log(e);
            
            }*/
        };
        // Listen for messages
        /*socket.addEventListener('message', function (e) {
            console.log('Message from server: ', e.data);
            
        });*/
        socket.onclose = function (code, reason) {
            dom.updateConnectionStatus('No Connction :(');
            dom.changeBGColor(0);
            // need to see if reason exists. If it does, check for the code.
            // I think this is to do if the connection exists, or it it just closed. 
            // I needed to do this because it would poll forever and crash the browser.
            if (reason && reason.code == 1006) {
                check();
            }
        };
        socket.onerror = function (evt) {
            //console.log(evt);
        };
    }
    function check() {
        if (socket === null || socket.readyState === WebSocket.CLOSED) {
            start();
        }
    }
    start();
    setInterval(check, config.poll);
}
document.addEventListener('click', e => {
    const button = e.target;
    button.closest('button');
    socket.send('bringMeTheDOM');
});
class SocketHandler {
    constructor() { }
}
const socketHandler = new SocketHandler();
export default socketHandler;
class ivyDOM {
    constructor() {
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.createConsole();
        this.createStatus();
    }
    createConsole() {
        this.console = document.createElement("div");
        this.consoleWrapper = document.createElement("section");
        this.consoleWrapper.setAttribute('class', 'console');
        this.consoleWrapper.appendChild(this.console);
        document.body.appendChild(this.consoleWrapper);
    }
    createStatus() {
        this.status = document.createElement("div");
        this.status.setAttribute('class', 'status');
        this.status.innerText = 'init';
        document.body.appendChild(this.status);
    }
    insert(content, location = 'console') {
        //let node = document.createTextNode(content);
        //this.console.appendChild(node);
        let line = document.createElement("p");
        line.textContent = content;
        this.console.appendChild(line);
    }
    updateConnectionStatus(update) {
        this.status.innerText = update;
    }
    changeBGColor(e) {
        if (e === 1) {
            document.body.setAttribute('class', 'connected');
        }
        else {
            document.body.removeAttribute('class');
        }
    }
    insertCSS(data) {
        const tag = document.createElement('style');
        this.head.appendChild(tag);
        tag.id = 'werd';
        tag.appendChild(document.createTextNode(data));
    }
}
