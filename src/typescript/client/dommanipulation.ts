/**
 * payload gets caled a lot which then cals what ever functions it needs to
 */

//@ts-ignore
import router from './router.js';

//@ts-ignore
import { ClassMapper } from "./ClassMapper.js";

//@ts-ignore
import { template } from './template.js';
import { timingSafeEqual } from 'crypto';

import { CustomSelect } from './vanilla-js-dropdown.js';

import { Select } from './select.js'

import { Modal } from './modal.js'

import Log from './log.js'

import {Idommanipulation, IAttributes, Ihtml} from './interface/idommanipulation.js'



let instance: any = null;

export default class DOMManipulation {

    dom: object;
    head = document.head || document.getElementsByTagName('head')[0];
    templateType = 'global'

    get body() {
        return document.body || document.getElementsByTagName('body')[0];
    }

    get content() {
        //return document.getElementsByClassName('content')[0];
        return document.getElementsByTagName('main')[0];
    }

    DOMData: object = {};
    DOMDataKey: string = null;

    lastTemplate: string = '';

    config = {
        contentSelector:"main",
        errorSelector:"error"
    }; // passed from client and set here

    cssClasses = {
        active: 'active',
        current: 'current'
    }

    get canvas() {
        return document.createElement("canvas");
    }
    progressiveSelectArray: object = {}

    widget: {}

    constructor() {

        console.log('DOM Class started... only one please');

        this._navigateInit();

        new Modal()
        //this.widget = 
    }

    public static getInstance() {
        if (instance === null) {
          instance = new DOMManipulation();
        }

        
        return instance;
    }


    public manipulate (json: Idommanipulation) {
        this.m(json);
    }
    /**
     * 
     * @param json Expects a payload with instructions to build DOM/HTML elements
     */
    public m (json: Idommanipulation) {
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
        let id = this._getKey(json);

        if (this.DOMDataKey != null) {
            id = this.DOMDataKey
        }
//console.log(888,id)
        try {
            var e = document.getElementById(id);
            e.innerText = json[id];
        } catch(e) {

            /**
             * 7th November, 2022
             * VERY HACKY
             * 
             * This allows us to push data into an already loaded template
             * Bad sides:
             * - only stores the last template
             * - this is all a bit pants
             */
            this.DOMData = json

            this._html({data:this.lastTemplate})
        }
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
                case 'upsert': this._upsertNode(element, obj['attr']); break;
                case 'update': this._updateNode(element, obj['attr']); break;
            }
        }
    }

    private _upsertNode (node: string, attributes: IAttributes) {

        if ("id" in attributes && attributes.id != "") {
            // id exists, continue
        } else {
            console.warn('Cannot upsert without an ID!');
            return false;
        }
        
        if (this.body.querySelector('#'+attributes.id) != null) {
            /**
             * elemenet exists, so call the update function
             */
             return this._updateNode(node, attributes);
        } else {
            /**
             * it doesn't exist so call the create function
             */
             return this._createNode(node, attributes);
        };
    }

    /**
     * Create a new DOM element and adds it to the document.
     * 
     * @param node 
     * @param attributes 
     */
    private _createNode (node: string, attributes: IAttributes) {

        var e = this.body.querySelector('#'+attributes.id);

        /**
         * This element doesn't exist on the current page, so create it instead of updating it
         */
        if (e === null) {
            e = document.createElement(node);
        } else {
            console.warn('Using _createNode when a node with the same ID already exists: #' + attributes.id);
            return false;
        }


        if(attributes.hasOwnProperty('id')) {
            e.setAttribute('id', attributes.id);
        }

        if(attributes.hasOwnProperty('class')) {
            if (Array.isArray(attributes.class)) {
                let l = attributes.class.length
                for (let i=0; i<l; i++) {
                    e.classList.add(attributes.class[i])
                }
            } else {
                e.classList.add(attributes.class)
            }
            
        }

        if(attributes.hasOwnProperty('addClass')) {
            if (Array.isArray(attributes.class)) {
                let l = attributes.class.length
                for (let i=0; i<l; i++) {
                    e.classList.add(attributes.class[i])
                }
            } else {
                e.classList.add(attributes.class)
            }
        }

        if(attributes.hasOwnProperty('removeClass')) {
            if (Array.isArray(attributes.class)) {
                let l = attributes.class.length
                for (let i=0; i<l; i++) {
                    e.classList.remove(attributes.class[i])
                }
            } else {
                e.classList.remove(attributes.class)
            }
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
         * template engine. Parses the string then compiles it with what ever is in this.DOMData
         */
        //this.DOMData = json
        //console.log('DOMData',this.DOMData)
        //console.log('DOMDataKey',this.DOMDataKey)
        //console.log('DOMJSON',json)
        //console.log('loadedContent',loadedContent)
        let parsedTemplate = template.parse(loadedContent);//, this.DOMData);

        this.lastTemplate = loadedContent

        try {
            //console.log(33)
            //console.log(parsedTemplate)
            loadedContent = template.compile(parsedTemplate, this.DOMData, this.DOMDataKey);
        } catch (e) {
            console.error('problem in dom template');
            console.error(e)

        }
        
        /**
         * we need a way to find out if what's in loadedContent is a complete HTML page, 
         * or a bit of one. We handle these differently
         * 
         * A GLOBAL template is with a compelte html structure
         * A LOCAL template is one with the main content selector present
         * A WIDGET template is one with just HTML fragments (div etc)
         * All loadedContent will either have HTML tags or it won't. Most will
         * 
         * LOCAL templates will replace everything in our primary content 
         * block (by default main.content)
         * WIDGET templates will loop and match elements that match the corresponding selector
         */

        /**
         * Check if the loadedContent starts with a DOCTYPE. If it does - this is a GLOBAL/LOCAL
         * template
         */

        if (loadedContent == null) {
            if (json.url) router.updateRouter(json.url);
            this._navigateCleanUpLinks(true)
            console.warn('dommanipulation::_html: Unable to parse json data into html')
            return
        } else if (loadedContent.startsWith('<!DOCTYPE') === true) {
            isWidget = false;
            this.templateType = 'global'
            router.updateRouter(json.url);
            this._navigateCleanUpLinks(false, json.url)
            console.log('_html is template: global');
        } else if (loadedContent.startsWith('<' + this.config.contentSelector) === true) {
            isWidget = false;
            this.templateType = 'local'
            router.updateRouter(json.url);
            this._navigateCleanUpLinks(false, json.url)
            console.log('_html is template: local');
        } else {
            isWidget = true;
            this.templateType = 'widget'
            console.log('_html is template: widget');
            
        }
        
        
        

        //html = this.sanitizeHTML(html);
        let temp = document.createElement('html');
        temp.innerHTML = loadedContent;


        
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


            loopLoaded: for (let i=0; i<gLength; i++) {
                  
                /**
                 * does this element have an ID?
                 */
                let id = g[i].id;

                if (id) {
                    console.log('id found \'' + id + '\', trying innerHTML replacement')
                    // we have an id, let try to find it in the existing document
                    try {
                        /**
                         * ID don't support only numbers. you need a letter in there according to the CSS3 selector spec
                         * https://stackoverflow.com/questions/37270787/uncaught-syntaxerror-failed-to-execute-queryselector-on-document
                         */
                        //let pageWidget = this.body.querySelector('[id='+id+']');
                        //let pageWidget = this.body.querySelector('#'+id);
                        let pageWidget = document.getElementById(id);

                        if (pageWidget) {
                            console.log('Updating widget contents: ' + id + ' with: ' + g[i].innerHTML)
                            // we found it! so lets update its contents
                            pageWidget.innerHTML = g[i].innerHTML;
                            window.dispatchEvent(new CustomEvent('widgetUpdated', {detail: {file:json.file,class:null,id:id}}));
                            /*
                            let svgArray = loadedBody.querySelectorAll('svg[data-url]');
                            let c = svgArray.length;
                            console.log(svgArray)
                            for (let i=0; i<c; i++) {

                                console.log(c[i])
                                
                                this._svgFile(c[i]);

                            }
                            */

                            if (id === 'modal') {
                                window.document.getElementById('modal').classList.add('open')
                            }
                            continue;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    
                    //continue;
                }

                /**
                 * next, lets see if both the TAG and the CLASS matches
                 * 
                 * does the loaded element have a CLASS?
                 */
                let classStr = g[i].classList[0];
                let nodeStr = g[i].nodeName;

                if (classStr) {
                    console.log('class found \'' + classStr + '\', starting innerHTML replacement')
                    // we'll use the first class found. Now we need to make sure the tag name
                    // matches
                    let pageWidgetArr = this.body.querySelectorAll('.'+classStr);
                    let pageWidgetLength = pageWidgetArr.length

                    loopCurrent: for (let ii=0; ii<pageWidgetLength; ii++) { 
                        if (pageWidgetArr[ii] && "nodeName" in pageWidgetArr[ii] && pageWidgetArr[ii].nodeName == nodeStr) {
                            // we found it! so lets update its contents
                            // but first, run a check to see if it's our main content widget 
                            // TODO this is a complete hack becasue we have TWO section.content nodes for  some reason
                            //let n = pageWidgetArr[ii].nodeName.toLowerCase();
                            //let c = classStr.toLowerCase();
                            //let nc = n + '.' + c;

                            //if (nc == this.config.contentSelector) {
                            //    pageWidgetArr[pageWidgetLength-1].innerHTML = g[i].innerHTML;
                            //    return
                            //} else {
                                pageWidgetArr[ii].innerHTML = g[i].innerHTML;
                                window.dispatchEvent(new CustomEvent('widgetUpdated', {detail: {file:json.file,class:classStr,id:null}}));
                            //}

                            continue;
                        }
                    }

                    continue;
                }

                /**
                 * either there is no id, or there was but it's not in the existing document
                 * lets just replace the content with what we've loaded
                 */
                this.content.appendChild(g[i]);
                
            }

            this.loading(false);
            this._progressiveSelect(loadedBody);
            
            return;
        }

        /**
         * We're dealing with a LOCAL or GLOBAL template (the same thing as far as the UI is concerned)
         * We can inject the whole thing into the default content area as is
         */
        let content = loadedBody.querySelector(this.config.contentSelector);
        
        /**
         * 'content' could be null if the HTML element does not exist
         * For example, the html file we call from the server, may not have the main.content node in it,
         * it could just have other page elements to update, but not the main content. If so, don't bother 
         * changing the current page 'content'
         */
        //let contentArr = loadedBody.querySelectorAll(this.config.contentSelector);
        //let contentLength = contentArr.length

        //let content = contentArr[contentLength-1];
        
        if (content) {
            this.content.innerHTML = content.innerHTML;
        }

        /**
         * updating the browser url is done in socketRouter and looks for a 'url' key
         */
        //router.updateRouter(json.url);
        this.loading(false);
        this._progressiveSelect(loadedBody);
        window.dispatchEvent(new CustomEvent('localUpdated'));
        
        this._scrollTo('class', this.config.contentSelector);
    }

    private _progressiveSelect (html) {
        const sselect = html.getElementsByTagName('select');

            const maxi = sselect.length;
            for (let ii=0; ii<maxi; ii++) {
                var y = new Select(null, sselect[ii].name);
            }
            

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
    public _navigateCleanUpLinks (force: Boolean = false, currentURL: string = null) {
        
        if (this.templateType == 'widget' && force === false) {
           return
        }

        if (!currentURL) {
            var currentURL = window.location.pathname.replace(/^|\/$/g, '');
        }

        let elementWithOldURLArr = this.body.querySelectorAll('a[class='+this.cssClasses.current+']:not([href=\''+currentURL+'\'])');
        let oldCount = elementWithOldURLArr.length;
        let elementWithCurrentURLArr = this.body.querySelectorAll('a[href=\''+currentURL+'\']');
        let currentCount = elementWithCurrentURLArr.length;
        

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

         for (let i=0; i<oldCount; i++) {

            /**
             * check to see if the a tag that has current has its href url the same.
             * If it's not the same, don't remove the current class
             */
            elementWithOldURLArr[i].classList.remove(this.cssClasses.current);

            /**
              * Time for a HACK :(
              * Lets check to see if this link is the direct child of a LI element, so we can apply the class to that as well
              */
            if (elementWithOldURLArr[i].parentElement.nodeName.toLowerCase() === 'li') {
                elementWithOldURLArr[i].parentElement.classList.remove(this.cssClasses.current);
            }
        }


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

    public _minjsFile (filePath: string) {

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

    public _mincssFile (filePath: string) {
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
    private Reload(updatedModuleInstance: object) {
        let mapper = new ClassMapper(this, updatedModuleInstance);
        let result = mapper.Merge();
    }

    public fileNotFound (file: string) {
        
    }

    private _scrollTo (type, classOrId) {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }


    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     * 
     * @param {Object} element The object to look at. This is so we can figure out the font and size.
     * @param {String} string The text itself.
     * 
     * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     */
    private _getTextWidth(element: any, text: string) {

        // re-use canvas object for better performance
        const canvas = this.canvas;
        const context = canvas.getContext("2d");
        context.font = this._getCanvasFont(element);
        const metrics = context.measureText(text);
        return metrics.width;
    }

    private _getCanvasFont(el = document.body) {
        const fontWeight = this._getCssStyle(el, 'font-weight') || 'normal';
        const fontSize = this._getCssStyle(el, 'font-size') || '16px';
        const fontFamily = this._getCssStyle(el, 'font-family') || 'Times New Roman';
        
        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }

    private _getCssStyle(element, prop) {
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }
}