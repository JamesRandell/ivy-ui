class DOMManipulation {
    constructor() {
        let btn = document.createElement("button");
        btn.innerText = 'Click me';
        document.body.appendChild(btn);
    }
    payload(key, value) {
        let that = this;
        //alert(key);
        that[key](value);
    }
    jsFile(s) {
        console.log(s);
    }
}
export default new DOMManipulation();
