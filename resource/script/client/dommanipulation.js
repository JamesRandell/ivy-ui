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
let instance = null;
export default class DOMManipulation extends hotModuleReload {
    constructor() {
        super();
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.body = document.body || document.getElementsByTagName('body')[0];
        this.content = document.getElementsByClassName('content')[0];
        this.cssClasses = {
            active: 'active',
            current: 'current'
        };
        const wrapper = document.createElement('section');
        wrapper.classList.add('content');
        //div.appendChild(this.content);
        this.content.parentNode.appendChild(wrapper);
        wrapper.appendChild(this.content);
        //this.content.replaceWith(div);
        console.log('DOM Class started... only one please');
        this._navigateInit();
    }
    static getInstance() {
        if (instance === null) {
            instance = new DOMManipulation();
        }
        return instance;
    }
    js(data) {
        //super.Reload(s);
    }
    /**
     *
     * @param json Expects a payload with instructions to build DOM/HTML elements
     */
    m(json) {
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
    _payload(json) {
        const key = this._getKey(json);
        // what if the value is a string (like loading an html file?)
        if (typeof json[key] === 'string') {
            return this['_' + key](json[key]);
        }
    }
    _ui(json) {
        const key = this._getKey(json);
        // what if the value is a string (like loading an html file?)
        if (typeof json[key] === 'string') {
            return this['_' + key](key);
        }
        // even though we store elements as objects (div, body, span etc), lets loop
        // over them all and call the child functions
        for (var subKey in json[key]) {
            if (json[key].hasOwnProperty(subKey)) {
                this['_' + key](subKey, json[key][subKey]);
            }
        }
    }
    /**
     * the payload is split into multiple sections, 'data' is seperate to 'ui' concerns.
     * I.e if we want to create an HTML node with 'ui' with some text, that text must go
     * into the 'data' part of the payload
     * @param json
     */
    _data(json) {
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
    _node(element, json) {
        for (var i = 0; i < json.length; i++) {
            var obj = json[i];
            switch (obj['verb']) {
                case 'add':
                    this._createNode(element, obj['attr']);
                    break;
                case 'insert':
                    this._createNode(element, obj['attr']);
                    break;
                case 'update':
                    this._updateNode(element, obj['attr']);
                    break;
            }
        }
    }
    _createNode(node, attributes) {
        var e = this.body.querySelector(attributes.id);
        /**
         * This element doesn't exist on the current page, so create it instead of updating it
         */
        if (e === null) {
            e = document.createElement(node);
        }
        if (attributes.hasOwnProperty('id')) {
            e.setAttribute('id', attributes.id);
        }
        if (attributes.hasOwnProperty('class')) {
            e.setAttribute('class', attributes.class);
        }
        if (attributes.hasOwnProperty('addClass')) {
            e.classList.add(attributes.class);
        }
        if (attributes.hasOwnProperty('removeClass')) {
            e.classList.remove(attributes.class);
        }
        this.body.appendChild(e);
    }
    _updateNode(node, attributes) {
        const e = this._getElement(attributes.id || node);
        if (typeof attributes === 'object') {
            var t;
            switch (this._getKey(attributes)) {
                case 'class':
                    t = attributes.class;
                    if (typeof t === 'object') {
                        for (const cssClass of t) {
                            e.setAttribute('class', cssClass);
                        }
                    }
                    else {
                        e.setAttribute('class', t);
                    }
                //break;
                case 'addClass':
                    t = attributes.addClass;
                    if (typeof t === 'object') {
                        for (const cssClass of t) {
                            e.classList.add(cssClass);
                        }
                    }
                    else {
                        e.classList.add(t);
                    }
                //break;
                case 'removeClass':
                    t = attributes.removeClass;
                    if (typeof t === 'object') {
                        for (const cssClass of t) {
                            e.classList.remove(cssClass);
                        }
                    }
                    else {
                        e.classList.remove(t);
                    }
                //break;
            }
        }
    }
    _html(json) {
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
            let currentPageWidget = this.body.querySelector('[id=' + widgetID + ']');
            if (currentPageWidget !== null) {
                currentPageWidget.innerHTML = amIAWidgetTemplate.innerHTML;
                return;
            }
        }
        var amIALocalTemplate = temp.querySelector('.content');
        if (amIALocalTemplate !== null) {
            this.content.innerHTML = amIALocalTemplate.innerHTML;
            //} else if (doIHaveBody !== null) {
            //this.body.innerHTML = doIHaveBody.innerHTML;
        }
        else {
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
        this.loading(false);
    }
    /**
     * Right now this is run when the page loads, and simply adds a few css classes to the current link
     *
     * There is also a bit of a hack in which we add/remove the same class to the parent element if it's a LI
     */
    _navigateInit() {
        this._navigateCleanUpLinks();
    }
    /**
     * We loops through any a tags with the current class assigned and remove them UNLESS it's HREF matches the current URL
     *
     * @param CurrentFile the URL that the user is currently on... RIGHT NOW!
     */
    _navigateCleanUpLinks(currentURL = null) {
        if (!currentURL) {
            var currentURL = window.location.pathname.replace(/^\/|\/$/g, '');
        }
        let elementWithOldURLArr = this.body.querySelectorAll('a[class=' + this.cssClasses.current + ']');
        let oldCount = elementWithOldURLArr.length;
        let elementWithCurrentURLArr = this.body.querySelectorAll('a[href=\'' + currentURL + '\']');
        let currentCount = elementWithCurrentURLArr.length;
        for (let i = 0; i < oldCount; i++) {
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
        for (let i = 0; i < currentCount; i++) {
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
    _navigate(file) {
        /**
         * just assume the page load worked for now and return true;
         */
        let currentURL = window.location.pathname.replace(/^\/|\/$/g, '');
        /**
         * remove the leading slash if there is one. This is because the webservier prolly uses
         * root relative url (/path/to/file) instead of handling url re-writes
         */
        //file = file.replace(/^\/+/g, '');
        /**
         * No change, user clicked the same link or something
         *
         */
        if (currentURL == file) {
            return;
        }
        var ss = 1;
        if (window.history && window.history.pushState) {
            window.onpopstate = function (event) {
                ss = 0;
                console.log('Back button was pressed.');
            };
            if (ss === 1) {
                console.log('s === true');
                window.history.pushState({ pageID: file }, file, file);
                ss = 0;
            }
        }
        this._navigateCleanUpLinks(file);
    }
    _htmlFile(path, parentNode = null) {
        this._HTMLFile(path, parentNode);
    }
    _HTMLFile(path, parentNode = null) {
        //var i = new router();
        //i.request('test.html')
        var e;
        if (parentNode === null) {
            e = this.body;
        }
        else {
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
                }
                else {
                    console.log('Error: ' + xhr.status); // An error occurred during the request.
                }
            }
        };
    }
    _insertHTML(html, parentNode = null) {
        const e = (parentNode) ? this.body : document.getElementById(parentNode);
        e.innerHTML = html;
    }
    _addHTML(html, parentNode = null) {
        this._insertHTML(html, parentNode);
    }
    _createHTML(html, parentNode = null) {
        this._insertHTML(html, parentNode);
    }
    /**
     * Sanitize and encode all HTML in a user-submitted string
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     *
     * @param str The returned HTML (hopefully)
     * @returns sanitized string
     */
    sanitizeHTML(str) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    ;
    loading(state = true) {
        if (state === true) {
            this._updateNode('body', { addClass: 'loading' });
        }
        else {
            this._updateNode('body', { removeClass: 'loading' });
        }
    }
    /**
     *
     * @param object helper function to get the key from a JSON object
     */
    _getKey(object) {
        return Object.keys(object)[0];
    }
    /**
     * So I realise I could be making a huge mistake here, but this is my all-in-one
     * DIY function to return an elements (or element[s])
     * @param selector could be anything!
     */
    _getElement(selector = null) {
        if (document.getElementById(selector)) {
            return document.getElementById(selector);
        }
        else if (document.getElementsByTagName(selector).length > 0) {
            return document.getElementsByTagName(selector)[0];
        }
        return null;
    }
}
