const q = {
    me: function () {

window.addEventListener("post-navigate", function(evt: object){
    console.warn(evt.detail);


  });

    }
}
q.me();
export default q