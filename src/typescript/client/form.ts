

//@ts-ignore
import { router } from "./client.js";

let instance: any = null;

interface IPayload {
    status?: number; // HTTP status code
    type?: string; // data type, like JSON or TEXT
    form?: object; // contains our form related data for processing
}

export default class Form {

    constructor() {

    }

    public static getInstance() {
        if (instance === null) {
            instance = new Form();
        }

        return instance;
    }

    public async formSubmit (e) {
        const url = e.detail.closest('form').getAttribute('action')

        var object = {};
        const formData = new FormData(e.detail);
        const value = Object.fromEntries(formData.entries());


        const that = Form.getInstance();
        let response = await router.post(url, value);
        if (response.status == 200) {
            that.handleServerResult(response)
        }
        

        
           
        
    }

    public handleServerResult (response: IPayload) {

        /**
         * 
         */
        const formData = response.form;
        const type = response.type;


    }

}


//export default form;