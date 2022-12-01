var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    formSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = e.detail.closest('form').getAttribute('action');
            var object = {};
            const formData = new FormData(e.detail);
            const value = Object.fromEntries(formData.entries());
            const that = Form.getInstance();
            let response = yield router.post(url, value);
            if (response.status == 200) {
                that.handleServerResult(response);
            }
        });
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
