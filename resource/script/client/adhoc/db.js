//@ts-ignore
import { hook } from "../client.js";
console.log(hook);
const db = {
    me: function () {
        console.log('ggg');
        //window.addEventListener("post-navigate", function(evt: object){
        //console.warn(evt.detail);
        //});
    }
};
window.removeEventListener("in-payload", test);
window.addEventListener("in-payload", test);
function test(evt) {
    console.log(1);
    //console.log(evt);
}
;
db.me();
export default db;
