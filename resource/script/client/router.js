/**
 * Placeholder untill I can flesh this out
 * Expect this to be a simple Express type app, first couple of methods
 * will toally be to read from the URI and make simple updates to it
 */
//@ts-ignore
import protocolWS from "./protocolWS.js";
//@ts-ignore
import protocolHTTP from "./protocolHTTP.js";
//@ts-ignore
import DOMManipulation from "./dommanipulation.js";
//@ts-ignore
import { config, registry, socketInit } from "./client.js";
//@ts-ignore
import { route } from "./route.js";
export default class router {
    /**
     * configure some sort of variable to select if we're going to send an
     * HTTP request or a WS one - you know, for 'fun'
     */
    serverType = 'ws';
    /**
     * Holds the class that deals with sending and receiving data to the
     * server, via which ever protocol we specify in the constructor
     */
    server = {};
    serverHTTP = {};
    serverWS = {};
    currentURL = "";
    constructor() {
        this.serverWS = protocolWS;
        this.serverHTTP = protocolHTTP;
        switch (this.serverType) {
            case 'ws':
                this.server = protocolWS;
                break;
            case 'http':
                this.server = protocolHTTP;
                break;
        }
        var historyMove = false;
        var that = this;
        (function (history) {
            var rpushState = history.pushState.bind(history);
            history.pushState = function (file) {
                historyMove = false;
                window.onpopstate = function (event) {
                    console.warn('popState:' + file.pageID);
                    historyMove = true;
                };
                if (historyMove === false && that.currentURL != file.pageID) {
                    rpushState({ pageID: file.pageID, prevURL: window.location.href }, file.pageID, file.pageID);
                }
            };
        })(window.history);
        /**
         * lets see if the user has landed on a page that isn't the default (like /test)
         * we've got a private function just to call the content they want. Yes it is
         * a double call because we're using re-write rules and a spa, but, the initial
         * call should still be light weight
         */
        this._landingCall();
        /**
         * we also need to keep an eye on URI changes at some point for proper routing
         */
        this._linkHandler();
    }
    /**
     * This gets a file from the server and 'sends' the user to it by updating the page,
     * URI, and history etc
     *
     * @param file name of the file to retrieve from the server
     * @param force specifies if we should force a load of the file. Ignores currentURL check
     */
    go(file, force = false) {
        const t = DOMManipulation.getInstance();
        let currentURL = window.location.pathname.replace(/^|\/$/g, '');
        /**
         * look at the config found in client.js for base Path, which tells us where
         * all the html files are
         */
        if (file.indexOf(config.basePath) === -1) {
            file = config.basePath + file;
        }
        this.goRoute(file);
        /**
         * @modified 30/10/2022
         * removed the blanked rule to prevent loading if the URL is the same as the file we want to load since we
         * changed out nginx rules to create a better SPA and client side routing experiance
         * We now prevent index.html from double loading - anything else is fair game
         */
        if (!force && window.location.pathname === file) {
            //if (!force && currentURL === file && currentURL !== '/index') {
            console.log('"' + currentURL + '" is the same as "' + file + '" so no loading');
            return;
        }
        t.loading(true);
        window.dispatchEvent(new CustomEvent('pre-pageRequest', { detail: file }));
        let y = this.server.go(file);
        y.then(resolved => {
            window.dispatchEvent(new CustomEvent('post-navigate', { detail: file }));
            t.loading(false);
        });
        return true;
    }
    /**
     * this takes a url and checks the routing table in routes to see if there are any secondary calls to make
     */
    goRoute(url) {
        if (route(url)) {
            for (let i = 0; i < route(url).length; i++) {
                this.server.go(route(url)[i]);
            }
            ;
        }
    }
    async post(url, data) {
        const t = DOMManipulation.getInstance();
        const p = await this.serverHTTP.go(url, 'post', data);
        console.log(url, p);
        t.loading(true);
        try {
            JSON.parse(p);
        }
        catch (e) {
            console.log('Incomming POST result is not JSON, ignoring');
            return false;
        }
        console.log(123);
        var file = p.payload.url;
        window.dispatchEvent(new CustomEvent('pre-pageRequest', { detail: file }));
        let y = this.server.go(file);
        y.then(resolved => {
            window.dispatchEvent(new CustomEvent('post-navigate', { detail: file }));
            t.loading(false);
        });
        return p;
        //this.server.go(url, data)
    }
    /**
     * This compliments the 'go' function in that it updates page elements instead of
     * the whole thing
     *
     * @param cmd the name of the server side command to run
     * @param data any ancillary data
     */
    request(cmd, data = []) {
        this.server.request(cmd, data);
    }
    load(cmd, data = []) {
        this.request(cmd, data);
    }
    get(cmd, data = []) {
        this.request(cmd, data);
    }
    /**
     * Intercepts hyperlink clicks and events in an attempt to load pages via a background process
     * and display the page inline
     *
     * Thinking about it, we can look for GLOBAL, LOCAL and WIDGET templates just like in IVY.
     * By default, all pages should load via LOCAL, so we seemlessly navigate around a site.
     * GLOBAL will change the entire layout and design
     * WIDGET will load a single element of the page (or multiple elements, just not the entire page content)
     */
    _linkHandler() {
        const that = this;
        document.body.addEventListener("click", function (event) {
            const { target } = event;
            let obj = target.closest("a");
            if (!obj) {
                return;
            }
            let href = obj.getAttribute('href');
            if (href.includes('#')) {
                console.log('Hyperlink is an anchor, running...');
                //return;
            }
            window.dispatchEvent(new CustomEvent('post-linkClick', { detail: href }));
            event.stopPropagation();
            event.preventDefault();
            that.go(href);
        }, false);
        document.body.addEventListener("submit", function (event) {
            const { target } = event;
            const href = target.getAttribute('action');
            window.dispatchEvent(new CustomEvent('form-submit', { detail: target }));
            event.stopPropagation();
            event.preventDefault();
        }, false);
        /*document.querySelectorAll("a").forEach((e) => {

            e.addEventListener("click", function(event) {
                let href = e.getAttribute('href');
                
                window.dispatchEvent(new CustomEvent('post-linkClick', {detail: href}));
                
                event.stopPropagation();
                //document.getElementById("output-box").innerHTML += "Sorry! <code>preventDefault()</code> won't let you check this!<br>";
                
                
                event.preventDefault();
                
                that.go(href);
            }, false);
        });*/
        window.addEventListener('popstate', (e) => {
            if (e.state == null) {
                return;
            }
            that.go(e.state.pageID, true);
        });
    }
    static updateRouter(file) {
        //let path = window.location.pathname.replace(/^\/|\/$/g, '');
        let path = file;
        if (!path)
            return;
        if (path == '')
            return;
        history.pushState({ pageID: file }, file, file);
        /**
         * it's fine! the user hasn't landed on any specific page, so just exist here
         */
        console.log(':: Updating router: ' + path);
        let pathArr = path.split('/'), i = 0;
        registry.id = null,
            registry.args = {};
        const pathArrLength = pathArr.length;
        /**
         * So, lets set up some rules that apply to our routing model. These follow the same rule set
         * that I use in ivy-php. For *most circumstances, we start with the controller, then action, then an id.
         * We also introduce a series of keywords that get seen as a key/value pair that are listed
         * below in a switch statement
         */
        /**
         * ONE parameter, so we assume this the name of an
         * ACTION (function)
         */
        if (pathArrLength === 1) {
            registry.controller = pathArr[0];
            return registry;
        }
        /**
         * TWO parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function)
         */
        if (pathArrLength === 2) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            return registry;
        }
        /**
         * THREE parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function) and
         * ID (record or row id)
         */
        if (pathArrLength === 3) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            registry.id = pathArr[2];
        }
        /**
         * FOUR or more parameters, so we assume this includes
         * CONTROLLER (page) and
         * ACTION (function) and
         * KEY/VALUE pairs
         */
        if (pathArrLength >= 4) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            // start from the 3rd parameter - s owe only loop over the key/value pairs
            for (i = 2; i < pathArrLength; i++) {
                /**
                 * the first parameter should be an ODD number,
                 * so ODD will be the key, EVEN will be the value
                 */
                // is even
                if (i % 2 === 0) {
                    // check if the NEXT array key exists, otherwise we have no key pair.
                    // if it doesn't exist, this 'key' is therefore an 'id'
                    if (pathArr[i + 1]) {
                        registry.args[pathArr[i]] = pathArr[i + 1];
                    }
                    else {
                        registry.id = pathArr[i];
                    }
                }
            }
        }
        return registry;
    }
    /**
     * Deals with sending the user to another page if they have directly landed on something
     * different than our index page (which is our default).
     * For instance /test
     *
     * Because this is one of the first things that's run, there is a chance our websocket
     * isn't set up yet
     *
     * @returns void
     */
    _landingCall() {
        const that = this;
        let path = window.location.pathname.replace(/^\/|\/$/g, '');
        /**
         * it's fine! the user hasn't landed on any specific page, so just exit here
         *
         * We also check if that path == index. This is so when the user first lands here, we force a call
         * to the server for the index page. This accounts for url with and without index as a page call
         */
        if (path == '' || path == 'index') {
            socketInit().then(function (s) {
                that.go('/index', true);
                return;
            });
        }
        let pathArr = path.split('/'), i = 0;
        registry.id = null,
            registry.args = {};
        const pathArrLength = pathArr.length;
        /**
         * So, lets set up some rules that apply to our routing model. These follow the same rule set
         * that I use in ivy-php. For *most circumstances, we start with the controller, then action, then an id.
         * We also introduce a series of keywords that get seen as a key/value pair that are listed
         * below in a switch statement
         */
        /**
         * ONE parameter, so we assume this the name of an
         * ACTION (function)
         */
        if (pathArrLength === 1) {
            registry.controller = pathArr[0];
            //socketInit().then(function(s){
            console.log('_landingCall 1 param');
            this.go('/' + registry.controller, true);
            return;
            //})
        }
        /**
         * TWO parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function)
         */
        if (pathArrLength === 2) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            socketInit().then(function (s) {
                that.go('/' + registry.controller + '/' + registry.action, true);
                return;
            });
        }
        /**
         * THREE parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function) and
         * ID (record or row id)
         */
        if (pathArrLength === 3) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            registry.id = pathArr[2];
        }
        /**
         * FOUR or more parameters, so we assume this includes
         * CONTROLLER (page) and
         * ACTION (function) and
         * KEY/VALUE pairs
         */
        if (pathArrLength >= 4) {
            registry.controller = pathArr[0];
            registry.action = pathArr[1];
            // start from the 3rd parameter - s owe only loop over the key/value pairs
            for (i = 2; i < pathArrLength; i++) {
                /**
                 * the first parameter should be an ODD number,
                 * so ODD will be the key, EVEN will be the value
                 */
                // is even
                if (i % 2 === 0) {
                    // check if the NEXT array key exists, otherwise we have no key pair.
                    // if it doesn't exist, this 'key' is therefore an 'id'
                    if (pathArr[i + 1]) {
                        registry.args[pathArr[i]] = pathArr[i + 1];
                    }
                    else {
                        registry.id = pathArr[i];
                    }
                }
            }
        }
    }
}
