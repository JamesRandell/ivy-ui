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
export default class router {
    constructor() {
        /**
         * configure some sort of variable to select if we're going to send an
         * HTTP request or a WS one - you know, for 'fun'
         */
        this.serverType = 'ws';
        /**
         * Holds the class that deals with sending and receiving data to the
         * server, via which ever protocol we specify in the constructor
         */
        this.server = {};
        switch (this.serverType) {
            case 'ws':
                this.server = protocolWS;
                break;
            case 'http':
                this.server = new protocolHTTP();
                break;
        }
        /**
         * lets see if the user has landed on a page that isn't the defaul (like /test)
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
     */
    go(file) {
        let t = DOMManipulation.getInstance();
        console.warn(file);
        this.server.go(file);
        return true;
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
        if (document.querySelector('a') === null) {
            return;
        }
        document.querySelectorAll("a").forEach((e) => {
            e.addEventListener("click", function (event) {
                event.stopPropagation();
                //document.getElementById("output-box").innerHTML += "Sorry! <code>preventDefault()</code> won't let you check this!<br>";
                let href = e.getAttribute('href');
                event.preventDefault();
                that.go(href);
            }, false);
        });
        window.addEventListener('popstate', (e) => {
            if (e.state == null) {
                return;
            }
            that.go(e.state.pageID);
            //console.log(e.state);
        });
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
        let path = window.location.pathname.replace(/^\/|\/$/g, '');
        /**
         * it's fine! the user hasn't landed on any specific page, so just exist here
         */
        if (path == '')
            return;
        let pathArr = path.split('/'), controller = 'index', action = 'index', id = null, args = {}, i = 0;
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
            controller = pathArr[0];
            this.go('/' + controller);
            return;
        }
        /**
         * TWO parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function)
         */
        if (pathArrLength === 2) {
            controller = pathArr[0];
            action = pathArr[1];
            this.go('/' + controller + '/' + action);
            return;
        }
        /**
         * THREE parameters, so we assume this the name of the
         * CONTROLLER (page) and
         * ACTION (function) and
         * ID (record or row id)
         */
        if (pathArrLength === 3) {
            controller = pathArr[0];
            action = pathArr[1];
            id = pathArr[2];
        }
        /**
         * FOUR or more parameters, so we assume this includes
         * CONTROLLER (page) and
         * ACTION (function) and
         * KEY/VALUE pairs
         */
        if (pathArrLength >= 4) {
            controller = pathArr[0];
            action = pathArr[1];
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
                        args[pathArr[i]] = pathArr[i + 1];
                    }
                    else {
                        id = pathArr[i];
                    }
                }
            }
        }
    }
}
