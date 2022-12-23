/**
 * Ahh our nice HTTP wrapper. This works in tandem (well, one or the other) with protocolHTTP
 * I thought it be interesting to pick and choose between sending and requesting data to the 
 * server via which ever protocol I want, in a way I can switch between by default, or per 
 * request
 */

//@ts-ignore
import iprotocol from "/resource/script/client/interface/iprotocol.js";

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
    async go (file: string, verb: string, data: object) {

        verb = this.checkVerb(verb);

        let json = {'payload':{'data':{},'type':{},status:null}};
        const response = await fetch(file, {
            method: verb,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type':'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        
        
        if (response.ok) {
            json.payload.type = this.processHeaderType(response.headers.get('Content-Type'));

            if (json.payload.type === 'json') {
                json.payload.data = await response.json();
            } else {
                json.payload.data = await response.text();
            }
            
            json.payload.status = response.status

            console.log('Data from HTTP request: ',json.payload.data)
            
            return Promise.resolve(json.payload.data);
        } else {
            return Promise.reject('** error');
        }
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