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
import hotModuleReload from '/resource/script/client/socketRouter.js';
export default class DOMManipulation extends hotModuleReload {
    constructor() {
        super();
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.body = document.body || document.getElementsByTagName('body')[0];
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
        var e = this._getElement(attributes.id || node);
        if (e === null) {
            e = document.createElement(node);
        }
        if (attributes.hasOwnProperty('id')) {
            e.setAttribute('id', attributes.id);
        }
        if (attributes.hasOwnProperty('class')) {
            e.setAttribute('class', attributes.class);
        }
        if (attributes.hasOwnProperty('addclass')) {
            e.classList.add(attributes.class);
        }
        if (attributes.hasOwnProperty('removeclass')) {
            e.classList.remove(attributes.class);
        }
        this.body.appendChild(e);
    }
    _updateNode(node, attributes) {
        const e = this._getElement(attributes.id || node);
        if (typeof attributes === 'object') {
            switch (this._getKey(attributes)) {
                case 'class': e.setAttribute('class', attributes.class);
                //break;
                case 'addclass': e.classList.add(attributes.addclass);
                //break;
                case 'removeclass': e.classList.remove(attributes.removeclass);
                //break;
            }
        }
    }
    _html(html) {
        var loadedContent = html;
        //html = this.sanitizeHTML(html);
        let temp = document.createElement('div');
        temp.innerHTML = html;
        var ele = temp.querySelector('span');
        console.log(ele);
        if (ele) {
            //if (replace) {
            this.body.innerHTML = ele.innerHTML;
            //} else {
            //  targetContainer.appendChild(ele);
            //}
        }
    }
    _htmlFile(path, parentNode = null) {
        this._HTMLFile(path, parentNode);
    }
    _HTMLFile(path, parentNode = null) {
        //var i = new router();
        //i.request('test.html')
        var e;
        if (parentNode === null) {
            console.log(1);
            e = this.body;
        }
        else {
            console.log(parentNode);
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
//export default new DOMManipulation();
