const q = {
    me: function () {
        window.addEventListener("post-navigate", function (evt) {
            console.warn(evt.detail);
        });
    }
};
q.me();
export default q;
