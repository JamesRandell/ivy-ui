class dommanipulation {


    constructor() {


    }

    public payload(key, value){
        let that = this;

        that[key](value); 
        

    }

    public jsFile (s) {
        console.log(s);
        alert(2);
    }

}
export default new dommanipulation();
