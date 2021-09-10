class dommanipulation {
    constructor() {
    }
    payload(key, value) {
        let that = this;
        that[key](value);
    }
    jsFile(s) {
        console.log(s);
        alert(2);
    }
}
export default new dommanipulation();
