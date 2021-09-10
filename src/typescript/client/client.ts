'use strict';

var config = {
    poll: 2000
};

document.addEventListener("DOMContentLoaded", ivyui);
//@ts-ignore
import myInstance from '/resource/script/client/dommanipulation.js';


var dom: ivyDOM;

function ivyui () {
    dom = new ivyDOM();
    connectSocket();

    dom.updateConnectionStatus('DOM Loaded');

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    console.log(params);
}
function connectSocket() {

    'use strict';

    var socket = null;

    function start () {
        socket = new WebSocket('ws://localhost:8081');

        socket.onopen = function(){
            console.log('connected!!');
            dom.updateConnectionStatus('Connected!!');
            dom.changeBGColor(1);
        };
        /*socket.addEventListener('open', function (e) {
            socket.send('Hello Server!');
            console.log('Connection open');
        });*/

        socket.onmessage = function(data){
            try {
                const result = JSON.parse(data.data);
                ivySocket.payload(result);
            } catch (e) {
                
            
            }

        };
        // Listen for messages
        /*socket.addEventListener('message', function (e) {
            console.log('Message from server: ', e.data);
            
        });*/

        socket.onclose = function(code, reason){
            dom.updateConnectionStatus('No Connction :(');
            dom.changeBGColor(0);
            // need to see if reason exists. If it does, check for the code.
            // I think this is to do if the connection exists, or it it just closed. 
            // I needed to do this because it would poll forever and crash the browser.
            if (reason && reason.code == 1006) {
                check();
            }
        };
  
        socket.onerror = function(evt) {
            //console.log(evt);
        }
    }
  
    function check() {
        if(socket === null || socket.readyState === WebSocket.CLOSED) {
            start();
        }
    }
    
    start();
    setInterval(check, config.poll);
}


var ivySocket = new class  {


    payload(data) {
        const key = Object.keys(data)[0];

        console.log("return " + key + "('" + data[key] + "');");
        socketHandler[key](data[key]);

        myInstance.payload(key, data[key]);

        //var func = new Function(
            //"return " + key + "(" + data[key] + ");"
        //)();

        //func();  

        
    }
};
/* 
could not get this working, It errors in tsc watch but works in browser
*/
//@ts-ignore
import { ClassMapper } from '/resource/script/client/ClassMapper.js';

class SocketHandler {
    constructor () {}

    cssFile (data) {
        dom.insertCSSLink(data);
    }

    jsFile (data) {
       const t = dom.insertJSLink(data);
        let mapper = new ClassMapper(t, data);
        //mapper.Merge();
        
    }
}
const socketHandler = new SocketHandler();
export default socketHandler;



class ivyDOM {

    console:    any;
    status;
    head = document.head || document.getElementsByTagName('head')[0];

    constructor() {
        this.createConsole();
        this.createStatus();
    }

    createConsole () {
        this.console = document.createElement("div");

        let consoleWrapper = document.createElement("section");
        consoleWrapper.setAttribute('class', 'console');

        consoleWrapper.appendChild(this.console);
        document.body.appendChild(consoleWrapper);
    }

    createStatus () {
        this.status = document.createElement("div");
        this.status.setAttribute('class', 'status');
        
        this.status.innerText ='init';
        document.body.appendChild(this.status); 
    }

    insert (content: any, location: string = 'console') {
        //let node = document.createTextNode(content);
        //this.console.appendChild(node);
    
        let line = document.createElement("p");
        line.textContent = content;
        this.console.appendChild(line);
    }

    updateConnectionStatus(update) {
        this.status.innerText = update;
    }

    changeBGColor (e: number) {
        if (e === 1) {
            document.body.setAttribute('class', 'connected');
        } else {
            document.body.removeAttribute('class');
        }
    }

    insertCSS (data: string) {
        const tag = document.createElement('style');
        this.head.appendChild(tag);
        tag.id = 'werd';
        tag.appendChild(document.createTextNode(data));
    }

    insertCSSLink (filename: string) {
       
        // lets see if this already exists
        var linkTag = this.head.querySelector("[href='" + filename + "']");
        
        
        if (linkTag) {console.log(filename);console.log(linkTag);
            linkTag.setAttribute('href', linkTag.getAttribute('href') + "");
            return;
        }
        
        const tag = document.createElement('link');
        //tag.id   = filename;
        tag.rel  = 'stylesheet';
        tag.type = 'text/css';
        tag.href = filename;
        tag.media = 'all';
        this.head.appendChild(tag);
    }

    insertJSLink (filename: string) {
       
        // lets see if this already exists
        var linkTag = this.head.querySelector("[src='" + filename + "']");
        
        
        if (linkTag) {console.log(filename);console.log(linkTag);
            //linkTag.setAttribute('src', linkTag.getAttribute('src') + "");
            //return;
            linkTag.parentNode.removeChild( linkTag )
        }
        
        const tag = document.createElement('script');
        tag.type = 'module';
        tag.src = filename + '?' + Date.now();
        this.head.appendChild(tag);
    }
}


(function(){
    var oldLog = console.log;
    console.log = function (message) {
        dom.insert(message, 'console');
        oldLog.apply(console, arguments);
        //dom.console.scrollIntoView(false);
        dom.console.scrollTop = dom.console.scrollHeight;
        
    };
})();


/*
window.console = {
    log : function(msg) {
        dom.insert(msg, 'console');
    },
    info : function(msg) {
        dom.insert(msg, 'console');
    },
    warn : function(msg) {
        dom.insert(msg, 'console');
    },

  }
  */