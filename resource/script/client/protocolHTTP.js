/**
 * Ahh our nice HTTP wrapper. This works in tandem (well, one or the other) with protocolHTTP
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
//export default class protocolWS implements iprotocol {
export default {
    verbList: 'POST,GET,DELETE,PUT',
    verbDefault: 'GET',
    /**
     * Uses the Web Fetch api to make an asynchronous request. Bolsters the resulting data (json or text)
     * with status codes ad other HTTP goodies
     *
     * @param file url to all
     * @param verb POST, PUT, DELETE, GET etc, what ever we need. Not all of these are accepted however
     * @param data JSON payload to send in the request (usually comes with a POST for example)
     * @returns Promise
     */
    go(file, verb, data) {
        return __awaiter(this, void 0, void 0, function* () {
            verb = this.checkVerb(verb);
            let json = { 'payload': { 'data': {}, 'type': {}, status: null } };
            const response = yield fetch(file, {
                method: verb,
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                json.payload.type = this.processHeaderType(response.headers.get('Content-Type'));
                if (json.payload.type === 'json') {
                    json.payload.data = yield response.json();
                }
                else {
                    json.payload.data = yield response.text();
                }
                json.payload.status = response.status;
                console.log('Data from HTTP request', json.payload.data);
                return Promise.resolve(json.payload.data);
            }
            else {
                return Promise.reject('** error');
            }
        });
    },
    /**
     * Compares the verb we want to use with our allowed list of verbs (specified at the top of this object)
     *
     * @param verb the HTTP verb to use, like POST or GET
     * @returns the checked verb
     */
    checkVerb(verb) {
        if (!this.verbList.includes(verb.toUpperCase())) {
            return this.verbDefault;
        }
        return verb.toUpperCase();
    },
    /**
     *
     * @param header Identifies the content type from the header.
     * @returns string content type
     */
    processHeaderType(header) {
        if (header.includes('application/json')) {
            return 'json';
        }
        return 'text';
    }
};
