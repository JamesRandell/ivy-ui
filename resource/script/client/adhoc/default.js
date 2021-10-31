//@ts-ignore
import { hook } from "../client.js";
console.log(hook);
const db = {
    me: function () {
        window.addEventListener("post-navigate", function (evt) {
            console.warn(evt.detail);
        });
    }
};
window.addEventListener("in-payload", function (evt) {
    console.log(4);
});
db.me();
export default db;
