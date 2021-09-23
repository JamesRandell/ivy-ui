/**
 * payload gets caled a lot which then cals what everfunctions it needs to
 */


/* 
could not get this working (the VSCode erroring not that actual class).
It errors in tsc watch but works in browser
*/
//@ts-ignore
import BaseModule from '/resource/script/client/BaseModule.js';

//@ts-ignore
import hotModuleReload from '/resource/script/client/hotModuleReload.js';

export default class DOMManipulation extends hotModuleReload {

    dom;
    head = document.head || document.getElementsByTagName('head')[0];


    constructor() {
        super();
        let btn = document.createElement("button");
  
        btn.innerText = 'Click me';
        document.body.appendChild(btn);
        console.log(99);
    }

    public payload(key: string, value: object){

        if (key === 'jsFile') {
            const hmr = new hotModuleReload();
            hmr.jsFile(value);
        } else if (key === 'cssFile') {
            const hmr = new hotModuleReload();
            hmr.cssFile(value);
        } else {

        let that = this;
        this[key](value); 
        console.log('wut: ' + this.constructor.name);
        //alert(key); 
        const y = 'ddd';
console.log(y);
        }
    }

    public ui (data) {
        console.log(data.ui);

    }
//public g () {}
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

    public js (data: string) {
        //super.Reload(s);
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

        super.Reload(this);
    }


    public ui_html (d)
    {console.log(4444);
        console.log(d);
    }


}
//export default new DOMManipulation();
