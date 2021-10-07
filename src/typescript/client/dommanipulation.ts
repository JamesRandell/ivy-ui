/**
 * payload gets caled a lot which then cals what everfunctions it needs to
 */


/**
 * Import a server wrapper so we can request stuff fro mthe server if a payload
 * comes in asking the client to load a file
 */
//@ts-ignore
//import router from "/resource/script/client/router.js";


/* 
could not get this working (the VSCode erroring not that actual class).
It errors in tsc watch but works in browser
*/
//@ts-ignore
import hotModuleReload from './socketRouter.js';

interface IAttributes {
    class?: string;
    addclass?: string;
    removeclass?: string;
    id?: string
}

let instance: any = null;

export default class DOMManipulation extends hotModuleReload {

    dom: object;
    head = document.head || document.getElementsByTagName('head')[0];
    body = document.body || document.getElementsByTagName('body')[0];
    content = document.getElementsByClassName('content')[0];

    cssClasses = {
        active: 'active',
        current: 'current'
    }


    constructor() {
        super();
        this._navigateInit();        
    }

    static getInstance() {
        if (instance === null) {
          instance = new DOMManipulation();
        }

        return instance;
    }

    public js (data: string) {
        //super.Reload(s);
    }


    /**
     * 
     * @param json Expects a payload with instructions to build DOM/HTML elements
     */
    public m (json: object) {
        const key = this._getKey(json);

        (json.hasOwnProperty('ui')) ? this._ui(json['ui']) : null;
        (json.hasOwnProperty('data')) ? this._data(json['data']) : null;

    }

    /**
     * I think this is what you can define as 'code smell' (as in, I know this is bad).
     * It looks like its function chainging - because it is! I just changed the JSON
     * structure to start with 'payload' as that's what I prefer.
     * 
     * @param json The entire json object from the server, usually with 
     * a 'payload;
     * @returns 
     */
    private _payload (json: object) {
        const key = this._getKey(json);

        // what if the value is a string (like loading an html file?)
        if (typeof json[key] === 'string') {
            return this['_'+key](json[key]);
        }


    }



    protected _ui (json: object) {
        const key = this._getKey(json);

        // what if the value is a string (like loading an html file?)
        if (typeof json[key] === 'string') {
            return this['_'+key](key);
        }
        // even though we store elements as objects (div, body, span etc), lets loop
        // over them all and call the child functions
        for (var subKey in json[key]) {
            if (json[key].hasOwnProperty(subKey)) {
                this['_'+key](subKey, json[key][subKey]);
            }
        }
    }

    /**
     * the payload is split into multiple sections, 'data' is seperate to 'ui' concerns.
     * I.e if we want to create an HTML node with 'ui' with some text, that text must go 
     * into the 'data' part of the payload
     * @param json 
     */
    private _data (json: object) {
        const id = this._getKey(json);

        var e = document.getElementById(id);
        e.innerText = json[id];
    }

    /**
     * Builds what ever node are in the array (like a div). Handles the verbs, such
     * as add/insert, remove/delete etc
     *
     * @param element type of HTML element. DIV, SPAN etc
     * @param json all the meta data to do with that element
     */
    private _node (element: string, json) {
        for(var i = 0; i < json.length; i++) {
            var obj = json[i];
            switch (obj['verb']) {
                case 'add'   : this._createNode(element, obj['attr']); break;
                case 'insert': this._createNode(element, obj['attr']); break;
                case 'update'   : this._updateNode(element, obj['attr']); break;
            }
        }
    }


    private _createNode (node: string, attributes: IAttributes) {

        var e = this.body.querySelector(attributes.id);

        /**
         * This element doesn't exist on the current page, so create it instead of updating it
         */
        if (e === null) {
            e = document.createElement(node);
        }


        if(attributes.hasOwnProperty('id')) {
            e.setAttribute('id', attributes.id);
        }

        if(attributes.hasOwnProperty('class')) {
            e.setAttribute('class', attributes.class);
        }

        if(attributes.hasOwnProperty('addclass')) {
            e.classList.add(attributes.class);
        }

        if(attributes.hasOwnProperty('removeclass')) {
            e.classList.remove(attributes.class);
        }

        this.body.appendChild(e);
    }

    public _updateNode (node: string, attributes: IAttributes) {

        const e = this._getElement(attributes.id || node);


        if (typeof attributes === 'object') {
            var t: any;
            switch (this._getKey(attributes)) {
                
                case 'class'    :   t = attributes.class;
                                    if (typeof t === 'object') {
                                        for (const cssClass of t) {
                                            e.setAttribute('class', cssClass);
                                        }
                                    } else {
                                        e.setAttribute('class', t);
                                    }
                                    //break;
                case 'addclass' :   t = attributes.addclass;
                                    if (typeof t === 'object') {
                                        for (const cssClass of t) {
                                            e.classList.add(cssClass);
                                        }
                                    } else {
                                        e.classList.add(t);
                                    }
                                    //break;
                case 'removeclass': t = attributes.removeclass;
                                    if (typeof t === 'object') {
                                        
                                        for (const cssClass of t) {
                                            e.classList.remove(cssClass);
                                        }
                                    } else {
                                        e.classList.remove(t);
                                    }
                                    //break;
            }
        }
    }

    private _html (json: any) {

        /**
         * we expect: 
         * json.html
         * json.file (maybe)
         */
        var loadedContent = json.data;

        //html = this.sanitizeHTML(html);
        let temp = document.createElement('html');
        temp.innerHTML = loadedContent;
        
        var r = this;
        //setTimeout(() => {r.postGo()},200);


        // i'll always have a body because the creation ofthe html node creates
        // head and body nodes

        /**
         * we can check for the first element in the body and what it's class is. If it 
         * matches an element with the same class in the calling page, then replace its 
         * content.
         */
        const body = temp.querySelector("body");
        let amIAWidgetTemplate = body.querySelector('*');

        if (amIAWidgetTemplate.id.length > 0) {

            let widgetID = amIAWidgetTemplate.id;

            /**
             * now lets see if the widget id exists in the current content
             */
            let currentPageWidget = this.body.querySelector('[id='+widgetID+']');

  
            if (currentPageWidget !== null) {
                currentPageWidget.innerHTML = amIAWidgetTemplate.innerHTML;
                return;

            }
        }

        var amIALocalTemplate = temp.querySelector('.content');
        
        if (amIALocalTemplate !== null) {

            this.content.innerHTML = amIALocalTemplate.innerHTML;

        //} else if (doIHaveBody !== null) {
          //  console.log('I have body');
            //this.body.innerHTML = doIHaveBody.innerHTML;

        } else {
            
            /**
             * the page we loaded is possibly a LOCAL or a WIDGET because it doesn't contain
             * <body> tags
             * 
             * So we can just insert the whole thing. However we can look for an id on the first
             * parent element to see if we need to replace anything
             */
            this.content.innerHTML = temp.innerHTML;

        }
        
        if (json.hasOwnProperty('file')) {
            this._navigate(json.file);
        }
        

    
    }

    /**
     * Right now this is run when the page loads, and simply adds a few css classes to the current link
     */
    private _navigateInit () {
        let currentFile = window.location.pathname.replace(/^\/|\/$/g, '');
        let allTheLinkWithURL = this.body.querySelectorAll('a[href=\''+currentFile+'\']');
        let allTheLinkWithURLCount = allTheLinkWithURL.length;

        for (let i=0; i<allTheLinkWithURLCount; i++) {
            
            allTheLinkWithURL[i].classList.add(this.cssClasses.current);
        }
    }


    private _navigate (file: string) {

        /**
         * just assume the page load worked for now and return true;
         */
        let currentFile = window.location.pathname.replace(/^\/|\/$/g, '');

        /**
         * No change, user clicked the same link or something
         * 
         */
        if (currentFile == file) {
            return;
        }

        window.history.pushState({pageID: file}, file, '/' + file);

        /**
         * we do some clean up on the DOM to fiddle about with classes, and add certain classes based on css rules
         */
        let linkWithOldURL = this.body.querySelectorAll('a[class='+this.cssClasses.current+']');
        let linkWithOldURLCount = linkWithOldURL.length;

        for (let i=0; i<linkWithOldURLCount; i++) {
            linkWithOldURL[i].classList.remove(this.cssClasses.current);
        }

        let linkWithNewURL = this.body.querySelectorAll('a[href=\''+file+'\']');
        let linkWithNewURLCount = linkWithNewURL.length;

        for (let i=0; i<linkWithNewURLCount; i++) {
            
            linkWithNewURL[i].classList.add(this.cssClasses.current);
        }

    }

    private _htmlFile (path: string, parentNode: string = null) {
        this._HTMLFile(path, parentNode);
    }
    
    private _HTMLFile (path: string, parentNode: string = null) {

        //var i = new router();
        //i.request('test.html')
        var e;
        if (parentNode=== null) {console.log(1);
             e = this.body;
        } else {console.log(parentNode);
             e = document.getElementById(parentNode);
        }
        
        console.log(e);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'test.html');
        xhr.send(null);

        xhr.onreadystatechange = function () {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
              if (xhr.status === OK) {
                console.log(xhr.responseText); // 'This is the returned text.'
                //e.innerHTML(xhr.responseText);
    
                } else {
                console.log('Error: ' + xhr.status); // An error occurred during the request.
              }
            }
          };

    }

    private _insertHTML (html: string, parentNode: string = null) {

        const e = (parentNode) ? this.body : document.getElementById(parentNode);

        e.innerHTML = html;
    }

    private _addHTML (html: string, parentNode: string = null) {
        this._insertHTML(html, parentNode);
    }

    private _createHTML (html: string, parentNode: string = null) {
        this._insertHTML(html, parentNode);
    }


    /**
     * Sanitize and encode all HTML in a user-submitted string
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     * 
     * @param str The returned HTML (hopefully)
     * @returns sanitized string
     */
    private sanitizeHTML (str: string) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };


    /**
     * 
     * @param object helper function to get the key from a JSON object
     */
    private _getKey (object: object) {
        return Object.keys(object)[0];
    }

    /**
     * So I realise I could be making a huge mistake here, but this is my all-in-one
     * DIY function to return an elements (or element[s])
     * @param selector could be anything!
     */
    private _getElement (selector: string = null) {

        if (document.getElementById(selector)) {
            return document.getElementById(selector);
        } else if (document.getElementsByTagName(selector).length > 0) {
            return document.getElementsByTagName(selector)[0];
        }

        return null
    }
    
}
//export default new DOMManipulation();
