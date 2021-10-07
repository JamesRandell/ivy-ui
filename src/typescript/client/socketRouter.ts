////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import { ClassMapper } from "./ClassMapper.js";



export default class socketRouter {


    head = document.head || document.getElementsByTagName('head')[0];
    body = document.body || document.getElementsByTagName('body')[0];

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
            
            if (typeof this['_'+cmd] !== 'function') {
                console.log('Can\'t reload file: Function \'_'+cmd+'\' does not exist in socketRouter');
            } else {

                this['_'+cmd](json.payload[cmd]);
            
            }

            i += 1;
        }
    }

    /**
     * Duplicate code from svg.ts run() function (sort), though this only does one
     * @param path location including file name of the svg file
     */
    private _svgFile (filePath: string) {

        let e = this.body.querySelector('svg[data-url="'+filePath+'"]');
        let url = e.getAttribute('data-url');

         
        if (e) {

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'image/svg+xml'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                return response.text();
            })
            .then(text => {
                let temp = document.createElement('html');
                temp.innerHTML = text;

                e.innerHTML = temp.innerHTML;

                console.log('Adding: ' + filePath);
                
            })
            .catch(console.error.bind(console));  
        }
    }
    
    public jsFile (filePath: string) {

        this._jsFile(filePath);
    }

    private _jsFile (path: string) { 

        const moduleName = path.split(/.*[\/|\\]/)[1].split('.')[0];

        // lets see if this already exists
        var linkTag = this.head.querySelector("[src^='" + path + "']");
        

        /**
         * Delete the existing version of this file from the page just to clean it up
         */
        if (linkTag) {
            linkTag.parentNode.removeChild(linkTag);
        }
        
        const tag = document.createElement('script');
        tag.type = 'module';
        tag.src = path + '?' + Date.now();
        this.head.appendChild(tag);

        console.log('Adding: ' + path + ' (' + moduleName + ')');

        this.Reload(this);
    }

    public cssFile (filePath: string) {

        this._cssFile(filePath);
    }

    private _cssFile (path: string) {


        // lets see if this already exists, match the first part of the name so we don't look for timestamps
        var linkTag = this.head.querySelector("[href^='" + path + "']");

        if (linkTag) {
            console.log('Updating: ' + path);
            linkTag.setAttribute('href', path + '?' + Date.now());
            return;
        }
        
        const tag = document.createElement('link');
        tag.rel  = 'stylesheet';
        tag.type = 'text/css';
        tag.href = path;
        tag.media = 'all';
        this.head.appendChild(tag);
        console.log('Adding: ' + path);

        
    }

    /**
     * The magic happens here! Essentially runs a delta check between the old object and the new object we just loaded in
     * 
     * @param updatedModuleInstance The combined 'this' keyword with everything loaded
     */
    Reload(updatedModuleInstance: object) {
        let mapper = new ClassMapper(this, updatedModuleInstance);
        let result = mapper.Merge();
    }


}