'use strict';
var config = {
    poll: 2000
};
document.addEventListener("DOMContentLoaded", ivyui);
var dom;
function ivyui() {
    dom = new ivyDOM();
    connectSocket();
    dom.updateConnectionStatus('DOM Loaded');
}
function connectSocket() {
    'use strict';
    var socket = null;
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
            try {
                const result = JSON.parse(data.data);
                ivySocket.payload(result);
            }
            catch (e) {
            }
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
var ivySocket = new class {
    payload(data) {
        const key = Object.keys(data)[0];
        console.log("return " + key + "('" + data[key] + "');");
        socketHandler[key](data[key]);
        //var func = new Function(
        //"return " + key + "(" + data[key] + ");"
        //)();
        //func();
    }
};
class SocketHandler {
    constructor() { }
    cssFile(data) {
        dom.insertCSSLink(data);
    }
    jsFile(data) {
        dom.insertJSLink(data);
    }
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
        this.console.setAttribute('class', 'console');
        document.body.appendChild(this.console);
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
    insertCSSLink(filename) {
        // lets see if this already exists
        var linkTag = this.head.querySelector("[href='" + filename + "']");
        if (linkTag) {
            console.log(filename);
            console.log(linkTag);
            linkTag.setAttribute('href', linkTag.getAttribute('href') + "");
            return;
        }
        const tag = document.createElement('link');
        //tag.id   = filename;
        tag.rel = 'stylesheet';
        tag.type = 'text/css';
        tag.href = filename;
        tag.media = 'all';
        this.head.appendChild(tag);
    }
    insertJSLink(filename) {
        // lets see if this already exists
        var linkTag = this.head.querySelector("[src='" + filename + "']");
        if (linkTag) {
            console.log(filename);
            console.log(linkTag);
            linkTag.setAttribute('src', linkTag.getAttribute('src') + "");
            return;
        }
        const tag = document.createElement('script');
        tag.type = 'module';
        tag.src = filename;
        this.head.appendChild(tag);
    }
}
(function () {
    var oldLog = console.log;
    console.log = function (message) {
        dom.insert(message, 'console');
        oldLog.apply(console, arguments);
    };
})();
