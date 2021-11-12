/**
 * Ahh our nice WS wrapper. This works in tandem (well, one or the other) with protocolHTTP
 * I thought it be interesting to pick and choose between sending and requesting data to the
 * server via which ever protocol I want, in a way I can switch between by default, or per
 * request
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// lts try object literal approach so we don't create new instances of this class every time we 
// want to call a page
//@ts-ignore
import { socketInit } from './client.js';
export default {
    //url: Constants.API_URL,
    request(cmd, data = []) {
        let json = { 'cmd': cmd };
        this.build(json);
        return null;
    },
    go(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = { 'file': file };
            yield this.build(json).then(resolved => {
                console.log('ff');
                return true;
            });
            //
            //});
            //console.log(response);
            //return true
        });
    },
    build(json) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                'payload': json,
                'key': ''
            };
            function socket(arg) {
                socketInit().then(function (server) {
                    server.send(JSON.stringify(arg));
                }).catch(function (err) {
                    console.log("Can't load page. Is the connection open?");
                });
            }
            //let y = new Promise((resolve,reject) => {
            //});
            //try {
            return Promise.resolve(socket(payload));
            //} catch (error) {
            //    console.error("ooops ", error);
            //    return false;
            //}
        });
    }
};
