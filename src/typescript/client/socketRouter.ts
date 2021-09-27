////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import { ClassMapper } from "/resource/script/client/ClassMapper.js";


export default class routerSocket {


    head = document.head || document.getElementsByTagName('head')[0];

    public payload(key: string, value: object){

        if (key === 'jsFile') {
            this.jsFile(value);
        } else if (key === 'cssFile') {
            this.cssFile(value);
        } else {
            // call the child method (i.e. _ui or _data)
            this['_'+key](value[key]); 
        }
    }

    public jsFile (filePath: object) {

        const path: string = filePath['jsFile'];

        this._jsFile(path);
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

    public cssFile (filePath: object) {

        const path: string = filePath['cssFile'];

        this._cssFile(path);
    }

    private _cssFile (path: string) {


        // lets see if this already exists
        var linkTag = this.head.querySelector("[href='" + path + "']");
        
        
        if (linkTag) {console.log(path);console.log(linkTag);
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