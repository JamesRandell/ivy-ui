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
        socket.send(JSON.stringify(payload));
        return null;
    }
};
/*
//@ts-ignore
import iprotocol from "/resource/script/client/interface/iprotocol.js";

export default class protocolWS implements iprotocol {


    constructor () {
        console.log(111);
    }

    public request (file: string, data: object = []) {
        return file;
        alert(9);
    }
}*/ 
