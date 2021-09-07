var config = {
    poll: 5000
};
document.addEventListener("DOMContentLoaded", connectSocket);
function connectSocket() {
    'use strict';
    var socket = null;
    function start() {
        socket = new WebSocket('ws://localhost:8081');
        socket.onopen = function () {
            console.log('connected!!');
            updateConnectionStatus('Connected!!');
            changeBGColor(1);
        };
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/
        socket.onmessage = function (e) {
            console.log(e.data);
        };
        // Listen for messages
        /*socket.addEventListener('message', function (e) {
            console.log('Message from server: ', e.data);
            
        });*/
        socket.onclose = function (code, reason) {
            updateConnectionStatus('No Connction :(');
            changeBGColor(0);
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
    setInterval(check, 5000);
}
var tag = document.createElement("div");
updateConnectionStatus('DOM Loaded');
tag.setAttribute('class', 'status');
var element = document.getElementsByTagName("body")[0];
element.appendChild(tag);
function updateConnectionStatus(text) {
    // var node = document.createTextNode(text);
    tag.innerText = text;
    ; //tag.appendChild(node);
}
function changeBGColor(e) {
    if (e === 1) {
        element.setAttribute('class', 'connected');
    }
    else {
        element.removeAttribute('class');
    }
}
class DOM {
    constructor() {
        this.body = {};
        this.body = document.getElementsByName('body')[0];
        this.createConsole();
    }
    createConsole() {
        this.console = document.createElement("div");
        this.console.setAttribute('class', 'console');
        console.log(80);
        this.console.appendChild(this.body);
    }
    insert(content, location = 'console') {
        let node = document.createTextNode(content);
        this.console.appendChild(node);
    }
}
(function () {
    var oldLog = console.log;
    console.log = function (message) {
        //alert(message);
        oldLog.apply(console, arguments);
    };
})();
new DOM();
/*window.console = {
    log : function(msg) {...},
    info : function(msg) {...},
    warn : function(msg) {...},
    //...
  }*/ 
