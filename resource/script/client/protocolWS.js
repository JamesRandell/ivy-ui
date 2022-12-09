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
    request(cmd, data = []) {
        let json = { 'cmd': cmd };
        this.build(json);
        return null;
    },
    async go(file, data) {
        console.log('protocolWS::go');
        let json = { 'url': file };
        await this.build(json).then(resolved => {
            return true;
        });
    },
    async build(json) {
        const payload = {
            'payload': json,
            'key': ''
        };
        async function socket(arg) {
            const loop = setInterval(async function () {
                try {
                    let server = await socketInit();
                    server.send(JSON.stringify(arg));
                    clearInterval(loop);
                }
                catch (e) {
                }
            }, 5);
            /*const y = socketInit().then(function(e){
                try {
                    console.log('Called from protocolWS inside try')
                    e.send(JSON.stringify(arg));
                    console.log('Called from protocolWS after send')
                } catch (w) {
                    console.log("Can't load page. Is the connection open?");
                    console.log(w)
                };
            });*/
        }
        return Promise.resolve(socket(payload));
    }
};
