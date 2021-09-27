/**
 * payload gets caled a lot which then cals what everfunctions it needs to
 */


/* 
could not get this working (the VSCode erroring not that actual class).
It errors in tsc watch but works in browser
*/
//@ts-ignore
import hotModuleReload from '/resource/script/client/socketRouter.js';

interface IAttributes {
    class?: string;
    addclass?: string;
    removeclass?: string;
    id?: string
}

export default class DOMManipulation extends hotModuleReload {

    dom: object;
    head = document.head || document.getElementsByTagName('head')[0];
    body = document.body || document.getElementsByTagName('body')[0];

    constructor() {
        super();
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
     * the paylaod is split into multiple sections, 'data' is seperate to 'ui' concerns.
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
        
        var e = this._getElement(attributes.id || node);
        
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
            switch (this._getKey(attributes)) {
                case 'class'    :   e.setAttribute('class', attributes.class);
                                    //break;
                case 'addclass' :   e.classList.add(attributes.addclass);
                                    //break;
                case 'removeclass': e.classList.remove(attributes.removeclass);
                                    //break;
            }
        }
    }

    private _HTMLFile (path: string, parentNode: string = null) {
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
                e.innerHTML(xhr.responseText);
    
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
