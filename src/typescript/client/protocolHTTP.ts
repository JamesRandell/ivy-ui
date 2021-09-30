/**
 * Ahh our nice HTTP wrapper. This works in tandem (well, one or the other) with protocolHTTP
 * I thought it be interesting to pick and choose between sending and requesting data to the 
 * server via which ever protocol I want, in a way I can switch between by default, or per 
 * request
 */

//@ts-ignore
import iprotocol from "/resource/script/client/interface/iprotocol.js";

export default class protocolWS implements iprotocol {


    constructor () {

    }


}