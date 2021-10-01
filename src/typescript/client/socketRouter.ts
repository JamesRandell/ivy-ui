////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import { ClassMapper } from "/resource/script/client/ClassMapper.js";


export default class socketRouter {


    head = document.head || document.getElementsByTagName('head')[0];

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

            console.log('Running \''+cmd+'\' with \''+json.payload[cmd]+'\'');
            switch (cmd) {
                case 'jsFile':  this.jsFile(json.payload['jsFile']);
                                break;
                case 'cssFile': this.cssFile(json.payload['cssFile']);
                                break;
                default:        this['_'+cmd](json.payload[cmd]);
            }

            i += 1;
        }
    }

    public jsFile (filePath: string) {

        this._jsFile(filePath);
    }

    private _jsFile (path: string) { 

        const filename = path.split(/.*[\/|\\]/)[1].split('.')[0];

        // lets see if this already exists
        var linkTag = this.head.querySelector("[src='" + path + "']");
        
        
        if (linkTag) {
            //linkTag.setAttribute('src', linkTag.getAttribute('src') + ""); 
            //return;
            linkTag.parentNode.removeChild( linkTag )
        }
        
        const tag = document.createElement('script');
        tag.type = 'module';
        tag.src = path;// + '?' + Date.now();
        this.head.appendChild(tag);

        console.log('Adding: ' + path + ' (' + filename + ')');

        this.Reload(this);
    }

    public cssFile (filePath: string) {

        this._cssFile(filePath);
    }

    private _cssFile (path: string) {


        // lets see if this already exists
        var linkTag = this.head.querySelector("[href='" + path + "']");

        if (linkTag) {
            linkTag.setAttribute('href', linkTag.getAttribute('href') + "");
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


    Reload(updatedModuleInstance){
        let mapper = new ClassMapper(this, updatedModuleInstance);
        mapper.Merge();
      }


}