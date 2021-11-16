/**
 * Ahh our nice WS wrapper. This works in tandem (well, one or the other) with protocolHTTP
 * I thought it be interesting to pick and choose between sending and requesting data to the 
 * server via which ever protocol I want, in a way I can switch between by default, or per 
 * request
 */

// lts try object literal approach so we don't create new instances of this class every time we 
// want to call a page
//@ts-ignore
import { socketInit } from './client.js';

export default {
    //url: Constants.API_URL,
    request (cmd: string, data: object = []) {
        let json = {'cmd':cmd};
        this.build(json);
        return null
    },

    async go (file: string) {
        let json = {'file':file};
        await this.build(json).then(resolved => {
            return true;
        });
    },

    async build (json: object) {
        const payload = {
            'payload': json,
            'key'   : ''
        };

        function socket (arg) {
            socketInit().then(function(server) {
                server.send(JSON.stringify(arg));
            }).catch(function(err) {
                console.log("Can't load page. Is the connection open?");
            });
        }

        return Promise.resolve(socket(payload));
    }
    
};