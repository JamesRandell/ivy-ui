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
    addClass?: string;
    removeClass?: string;
    id?: string
}

interface Ihtml {
    data?: string; // the HTML of the page returned
    file?: string; // file name including path that the server returned (URL)
    statusCode?: number; // HTTP status code
}

let instance: any = null;

export default class DOMManipulation {

    dom: object;
    head = document.head || document.getElementsByTagName('head')[0];
    body = document.body || document.getElementsByTagName('body')[0];
    content = document.getElementsByClassName('content')[0];
    config = {
        contentSelector:"section.content"
    }; // passed from client and set here

    cssClasses = {
        active: 'active',
        current: 'current'
    }


    constructor() {
        //super();
        const wrapper = document.createElement('section');
        wrapper.classList.add('content');
         
        this.content.parentNode.appendChild(wrapper);
        wrapper.appendChild(this.content);

        console.log('DOM Class started... only one please');

         var historyMove = false;
         var that = this;
        (function(history){
            
            var rpushState = history.pushState.bind(history);

            history.pushState = function(file) {
                historyMove = false;
                window.onpopstate = function(event) {
                    console.warn('popState:' + file.pageID);
                    historyMove = true;
                }

                if (historyMove === false && that.curentURL != file.pageID) {
                    rpushState({pageID: file.pageID}, file.pageID,  file.pageID);
                }
            };
        })(window.history);

        this._navigateInit();
    }

    public static getInstance() {
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
     * It looks like its function chaining - because it is! I just changed the JSON
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

        if(attributes.hasOwnProperty('addClass')) {
            e.classList.add(attributes.class);
        }

        if(attributes.hasOwnProperty('removeClass')) {
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
                case 'addClass' :   t = attributes.addClass;
                                    if (typeof t === 'object') {
                                        for (const cssClass of t) {
                                            e.classList.add(cssClass);
                                        }
                                    } else {
                                        e.classList.add(t);
                                    }
                                    //break;
                case 'removeClass': t = attributes.removeClass;
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
    /**
     * Handles inserting HTML into the DOM
     * we expect: 
     * json.html
     * json.file (maybe)
     * 
     * @param json HTML payload. Can be a fragment, or a complete valid html document
     * 
     * @returns 
     */
    private _html (json: Ihtml) {

        var loadedContent = json.data;
        var isWidget:boolean;

        /**
         * we need a way to find out if what's in loadedContent is a complete HTML page, 
         * or a bit of one. We handle these differently
         * 
         * A LOCAL template is one with complete html structure
         * A WIDGET template is one with just HTML fragments (div etc)
         * All loadedContent will either have HTML tags or it won't. Most will
         * 
         * LOCAL templates will replace everything in our primary content 
         * block (by default section.content)
         * WIDGET templates will loop and match elements that match the corresponding selector
         */

        /**
         * Check if the loadedContent starts with a DOCTYPE. If it does - this is a GLOBAL/LOCAL
         * template
         */
        if (loadedContent.startsWith('<!DOCTYPE') === true) {
            isWidget = false;
        } else {
            isWidget = true;
        }
        
        //html = this.sanitizeHTML(html);
        let temp = document.createElement('html');
        temp.innerHTML = loadedContent;
        
        var r = this;


        // i'll always have a body because the creation of the html node creates
        // head and body nodes

        /**
         * we can check for the first element in the body and what it's class is. If it 
         * matches an element with the same class in the calling page, then replace its 
         * content.
         */
        const loadedBody = temp.querySelector("body");
        
        /**
         * We're dealing with a WIDGET, that is, an HTML fragment. 
         * We now need to perform some tests to attempt to replace current 
         * content with things from the WIDGET
         */
        if (isWidget === true) {
            let g = loadedBody.querySelectorAll('body > *');
            let gLength = g.length;

            for (let i=0; i<gLength; i++) {
   
                /**
                 * does this element have an ID?
                 */
                let id = g[i].id;

                if (id) {
                    // we have an id, let try to find it in the existing document
                    let pageWidget = this.body.querySelector('[id='+id+']');

                    if (pageWidget) {
                        // we found it! so lets update its contents
                        pageWidget.innerHTML = g[i].innerHTML;
                        continue;
                    }
                }
                    
                /**
                 * either there is no id, or there was but it's not in the existing document
                 * lets just replace the content with what we've loaded
                 */
                let y = this.content;
                //console.log('appending2');
                this.content.appendChild(g[i]);
            }

            this.loading(false);
            return;
        }

        /**
         * We're dealing with a LOCAL or GLOBAL template (the same thing as far as the UI is concerned)
         * We can inject the whole thing into the default content area as is
         */
        let content = loadedBody.querySelector(this.config.contentSelector);

        this.content.innerHTML = content.innerHTML;

        if (json.hasOwnProperty('file')) {
            this._navigate(json.file);
        }
        
        this.loading(false);
    }

    /**
     * Right now this is run when the page loads, and simply adds a few css classes to the current link
     * 
     * There is also a bit of a hack in which we add/remove the same class to the parent element if it's a LI
     */
    private _navigateInit () {
        
        this._navigateCleanUpLinks();
    }

    /**
     * We loops through any a tags with the current class assigned and remove them UNLESS it's HREF matches the current URL
     * 
     * @param CurrentFile the URL that the user is currently on... RIGHT NOW!
     */
    public _navigateCleanUpLinks (currentURL: string = null) {

        if (!currentURL) {
            var currentURL = window.location.pathname.replace(/^|\/$/g, '');
        }

        let elementWithOldURLArr = this.body.querySelectorAll('a[class='+this.cssClasses.current+']');
        let oldCount = elementWithOldURLArr.length;
        let elementWithCurrentURLArr = this.body.querySelectorAll('a[href=\''+currentURL+'\']');
        let currentCount = elementWithCurrentURLArr.length;
        

        for (let i=0; i<oldCount; i++) {
            elementWithOldURLArr[i].classList.remove(this.cssClasses.current);

            /**
              * Time for a HACK :(
              * Lets check to see if this link is the direct child of a LI element, so we can apply the class to that as well
              */
            if (elementWithOldURLArr[i].parentElement.nodeName.toLowerCase() === 'li') {
                elementWithOldURLArr[i].parentElement.classList.remove(this.cssClasses.current);
            }
        }

        /**
         * Now we add the class to the current file
         */
         for (let i=0; i<currentCount; i++) {
             
            elementWithCurrentURLArr[i].classList.add(this.cssClasses.current);
 
             /**
              * Time for a HACK :(
              * Lets check to see if this link is the direct child of a LI element, so we can apply the class to that as well
              */
              if (elementWithCurrentURLArr[i].parentElement.nodeName.toLowerCase() === 'li') {
                elementWithCurrentURLArr[i].parentElement.classList.add(this.cssClasses.current);
              }
         }
    }

    public _navigate (file: string = null) {

        /**
         * just assume the page load worked for now and return true;
         */
        let currentURL = window.location.pathname.replace(/^|\/$/g, '');

        /**
         * remove the leading slash if there is one. This is because the webservier prolly uses
         * root relative url (/path/to/file) instead of handling url re-writes
         */
        //file = file.replace(/^\/+/g, '');

        /**
         * No change, user clicked the same link or something
         * 
         */
        if (file && currentURL == file) {
            return;
        }

        window.dispatchEvent(new CustomEvent('post-navigate', {detail: file}));
        
        this._navigateCleanUpLinks(file);

        history.pushState({pageID: file}, file,  file);
    }

    private _htmlFile (path: string, parentNode: string = null) {
        this._HTMLFile(path, parentNode);
    }
    
    private _HTMLFile (path: string, parentNode: string = null) {

        //var i = new router();
        //i.request('test.html')
        var e;
        if (parentNode=== null) {
             e = this.body;
        } else {
             e = document.getElementById(parentNode);
        }
        
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

    public loading (state: boolean = true) {

        if (state === true) {
            this._updateNode('body', {addClass: 'loading'});
        } else {
            this._updateNode('body', {removeClass: 'loading'});
        }
    }
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

    /**
     * The relative path to the current page the browser is on
     * @returns string of the relative path 
     */
    public get curentURL () {
        return window.location.pathname.replace(/^|\/$/g, '');
    }
}