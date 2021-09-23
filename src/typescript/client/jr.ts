


//alert(984);
//console.log(433);

//@ts-ignore
import BaseModule from '/resource/script/client/BaseModule.js';

class jr extends BaseModule {
    constructor () {
        super()
        console.log('Constructor');

        this.test();
    }

    public test () {
        console.log('qll');
    }
    
}
 
export default new jr();
