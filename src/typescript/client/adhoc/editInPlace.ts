//@ts-ignore
import { router } from "./../client.js";

import Log from './../log.js'
const log = Log.getInstance();

export default class editInPlace {
    constructor() {
        const that = this

        window.addEventListener("click", (event) => {
            const e = event.target as HTMLInputElement;
            const editable = e.getAttribute('contenteditable')

            if (editable == 'true') {
                that.editMode(event.target)
            }

            
        });

        
    }

    public editMode(ele) {
        this._preventNewLine(ele);
        
    }

    private _preventNewLine(ele) {
        const that=this
        ele.onkeydown = function (e) {
            if (!e) {
                e = window.event;
            }
            if (e.key == 'Enter') {
                
                e.preventDefault();
                ele.blur();
                that._sendEdit(ele);
            }
            
           
        }
    }

    private async _sendEdit (ele) {
        const value = ele.innerText;
        const that=this;
        const url = ele.getAttribute('data-post');

        if (!ele.getAttribute('data-post')) {
            return
        }

        let response = await router.post(url, value);

        console.info('Form submitted')
        console.log(response)
        console.log(response.status)
        if (response.status == 200) {
          log.msg('good to go!')
            console.info('stuff goes here')
        }
    }
}

