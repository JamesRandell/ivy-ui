class form {



    public formSubmit (e) {


        var object = {};
        const formData = new FormData(e.detail);
        const value = Object.fromEntries(formData.entries());
        console.log(value);


    }

    

}


export default form;