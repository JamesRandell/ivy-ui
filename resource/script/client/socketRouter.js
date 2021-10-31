////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';
//@ts-ignore
import DOMManipulation from "./dommanipulation.js";
//@ts-ignore 
import * as adhoc from './adhoc/index.js';
export default class socketRouter {
    constructor() {
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.body = document.body || document.getElementsByTagName('body')[0];
    }
    message(json) {
        if (!json.hasOwnProperty('payload')) {
            // don't bother processing
            console.warn('\'' + Object.keys(json)[0] + '\' is not a suitable message key');
            return;
        }
        /**
         * loop through the payload keys. We then test if the key is a string and try to run the function in our 'library'
         */
        var keys = Object.keys(json.payload), len = keys.length, i = 0, cmd;
        while (i < len) {
            cmd = keys[i];
            if (typeof cmd != 'string') {
                continue;
            }
            if (typeof json.payload[cmd] === 'string') {
                //console.log('Running \''+cmd+'\' with \''+json.payload[cmd].substring(0,255)+'\'');
            }
            else {
                //console.log('Running \''+cmd+'\' with an object returned');
            }
            window.dispatchEvent(new CustomEvent('in-payload', json.payload));
            if (typeof 'db' == 'function') {
                alert(9);
            }
            if ('db' in adhoc) {
                alert("yes, i have that property");
            }
            const t = DOMManipulation.getInstance();
            if (typeof t['_' + cmd] !== 'function') {
                console.log('Can\'t reload file: Function \'_' + cmd + '\' does not exist in socketRouter');
            }
            else {
                t['_' + cmd](json.payload[cmd]);
            }
            i += 1;
        }
    }
}
