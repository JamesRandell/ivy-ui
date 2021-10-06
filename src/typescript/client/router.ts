/**
 * Placeholder untill I can flesh this out
 * Expect this to be a simple Express type app, first couple of methods
 * will toally be to read from the URI and make simple updates to it
 */

//@ts-ignore
import protocolWS from "./protocolWS.js";

//@ts-ignore
import protocolHTTP from "./protocolHTTP.js";

import iprotocol from "./interface/iprotocol";

//@ts-ignore
import DOMManipulation from "./dommanipulation.js";


export default class router implements iprotocol {

    /**
     * configure some sort of variable to select if we're going to send an
     * HTTP request or a WS one - you know, for 'fun'
     */
    serverType: string = 'ws';

    /**
     * Holds the class that deals with sending and receiving data to the 
     * server, via which ever protocol we specify in the constructor
     */
    server: any = {};

    constructor () {

        switch (this.serverType) {
            case 'ws'   :   this.server = protocolWS;
                            break;
            case 'http'   : this.server = new protocolHTTP();
                            break;

        }

        /** 
         * we also need to keep an eye on URI changes at some point for proper routing
         */
        this._linkHandler();
    }

    /**
     * This gets a file from the server and 'sends' the user to it by updating the page,
     * URI, and history etc
     * 
     * @param file name of thefile to retrieve from the server
     */
    public go (file: string) {

        let t = DOMManipulation.getInstance();
 
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
    public request (cmd: string, data: object = []) {
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
    private _linkHandler() {

        const that: any = this;
        if (document.querySelector('a') === null) {
            return;
        }
        
        document.querySelectorAll("a").forEach((e) => {

            e.addEventListener("click", function(event) {

                event.stopPropagation();
                //document.getElementById("output-box").innerHTML += "Sorry! <code>preventDefault()</code> won't let you check this!<br>";
                
                let href = e.getAttribute('href');
                event.preventDefault();
                that.go(href);
            }, false);
        });

        window.addEventListener('popstate',(e)=>{

            if (e.state == null) {
                return;
            }
            that.go(e.state.pageID);
            //console.log(e.state);
        });

    }
}