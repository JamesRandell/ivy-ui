class DOMManipulation {

    dom;

    constructor() {
        let btn = document.createElement("button");

        btn.innerText = 'Click me';
        document.body.appendChild(btn);

    }

    public payload(key, value){
        let that = this;
//alert(key);
        that[key](value); 
        

    }

    public jsFile (s) {
        console.log(s);

    }



}
export default new DOMManipulation();
