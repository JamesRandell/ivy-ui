//@ts-ignore
import { router } from "./client.js";
let instance = null;
export default class Form {
    constructor() {
    }
    static getInstance() {
        if (instance === null) {
            instance = new Form();
        }
        return instance;
    }
    async formSubmit(e) {
        const url = e.detail.closest('form').getAttribute('action');
        var object = {};
        const formData = new FormData(e.detail);
        const value = Object.fromEntries(formData.entries());
        const that = Form.getInstance();
        let response = await router.post(url, value);
        console.info('Form submitted');
        if (response.status == 200) {
            that.handleServerResult(response);
            console.info('stuff goes here');
        }
    }
    handleServerResult(response) {
        /**
         *
         */
        const formData = response.form;
        const type = response.type;
    }
}
//export default form;
