/**
 * Ahh our nice WS wrapper. This works in tandem (well, one or the other) with protocolHTTP
 * I thought it be interesting to pick and choose between sending and requesting data to the
 * server via which ever protocol I want, in a way I can switch between by default, or per
 * request
 */
// lts try object literal approach so we don't create new instances of this class every time we 
// want to call a page
//@ts-ignore
import { socket } from './client.js';
export default {
    //url: Constants.API_URL,
    request(cmd, data = []) {
        let json = { 'cmd': cmd };
        this.build(json);
        return null;
    },
    go(file) {
        let json = { 'file': file };
        this.build(json);
        return true;
    },
    build(json) {
        const payload = {
            'payload': json,
            'key': ''
        };
        /*
        socket2.then(function () {
            this.send(payload);
            console.log(payload);
          }).catch((msg) => {
            console.log(msg)
          })
*/
        console.log('load the routed page');
        try {
            socket(payload);
        }
        catch (error) {
            console.error("ooops ", error);
        }
    }
    //socket(JSON.stringify(payload));
};
