////@ts-ignore
//import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import { ClassMapper } from "/resource/script/client/ClassMapper.js";

export default class BaseModule {


    head = document.head || document.getElementsByTagName('head')[0];

    public cssFile (data: object) {

        const filename: string = data['cssFile'];

        // lets see if this already exists
        var linkTag = this.head.querySelector("[href='" + filename + "']");
        
        
        if (linkTag) {console.log(filename);console.log(linkTag);
            linkTag.setAttribute('href', linkTag.getAttribute('href') + "");
            return;
        }
        
        const tag = document.createElement('link');
        tag.rel  = 'stylesheet';
        tag.type = 'text/css';
        tag.href = filename;
        tag.media = 'all';
        this.head.appendChild(tag);
        console.log('Adding: ' + filename);
    }

    public jsFile (data: object) { 
       
        const path: string = data['jsFile'];

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

    Reload(updatedModuleInstance){
        let mapper = new ClassMapper(this, updatedModuleInstance);
        mapper.Merge();
      }


}