////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import { ClassMapper } from "./ClassMapper.js";

//@ts-ignore
import DOMManipulation from "./dommanipulation.js";

//@ts-ignore 
import * as adhoc from './adhoc/index.js';
import db from "./adhoc/db.js";

import registry from './router.js';
import router from './router.js';

export default class payloadProcessor {

    public message(json: any) {

        if (!json.hasOwnProperty('payload')) {
            // don't bother processing
            console.warn('\'' + Object.keys(json)[0] + '\' is not a suitable message key');
            return;
        }

        /**
         * loop through the payload keys. We then test if the key is a string and try to run the function in our 'library'
         */
        var keys = Object.keys(json.payload),
            len = keys.length,
            i = 0,
            cmd: string;

        const dommanipulationinstance = DOMManipulation.getInstance();

        while (i < len) {
            cmd = keys[i];

            if (typeof cmd != 'string') {
               continue;
            }

            if (typeof json.payload[cmd] === 'string') {
                //console.log('Running \''+cmd+'\' with \''+json.payload[cmd].substring(0,255)+'\'');
            } else {
                //console.log('Running \''+cmd+'\' with an object returned');
            }
            
            window.dispatchEvent(new CustomEvent('in-payload', {detail:json.payload}));

            
            if (typeof 'db' == 'function') { 
                alert(9);
            }
            if('db' in adhoc){
                alert("yes, i have that property");
            }
            if (cmd == "html") {
                if (json.payload.html.statuscode == 404) {
                    console.error('File not found: ' + json.payload.html.file);
                    window.dispatchEvent(new CustomEvent('fileNotFound', {detail: json.payload.html.file}));
                    return
                }
                if (json.payload["html"]["url"]) {
                    
                    
                    //console.table(registry.updateRouter())
                }
            }

            if (cmd == "data") {
                dommanipulationinstance.DOMData = json.payload
                try {
                    dommanipulationinstance.DOMDataKey = json.key
                } catch(e) {
                    dommanipulationinstance.DOMDataKey = null
                }
                
                dommanipulationinstance.m(dommanipulationinstance.lastTemplate)
            }
            
            if (typeof dommanipulationinstance['_'+cmd] !== 'function') {
                //console.log('Can\'t reload file: Function \'_'+cmd+'\' does not exist in socketRouter');
            } else {
                dommanipulationinstance['_'+cmd](json.payload[cmd]);
            }

            i += 1;
        }
    }

}