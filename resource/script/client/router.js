/**
 * Placeholder untill I can flesh this out
 * Expect this to be a simple Express type app, first couple of methods
 * will toally be to read from the URI and make simple updates to it
 */
//@ts-ignore
import protocolWS from "/resource/script/client/protocolWS.js";
//@ts-ignore
import protocolHTTP from "/resource/script/client/protocolHTTP.js";
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
        // we also need to keep an eye on URI changes at some point for proper routing
    }
    /**
     * This gets a file from the server and 'sends' the user to it by updating the page,
     * URI, and history etc
     *
     * @param file name of thefile to retrieve from the server
     */
    go(file) {
        this.server.go(file);
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
}
