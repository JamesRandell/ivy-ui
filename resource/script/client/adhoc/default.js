//@ts-ignore
import { hook } from "../client.js";
console.log(hook);
const q = {
    me: function () {
        window.addEventListener("post-navigate", function (evt) {
            console.warn(evt.detail);
        });
    }
};
console.log(4);
q.me();
export default q;
