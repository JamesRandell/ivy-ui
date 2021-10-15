//@ts-ignore
import DOMManipulation from './dommanipulation.js';
import test from './test.js';

/**
 * For HMR to work, we need to export an instance of the class and not the class itself
 */
class svg extends DOMManipulation {

    //i:number = 0;

    constructor () {
        super();
        //console.log(this.i);
        //this.i++; 
        this.run();
        
    }

    public run () { 
         let svgArray = this.body.querySelectorAll('svg[data-url]');

         let c = svgArray.length;
//console.log(c);
         for (let i=0; i<c; i++) {

            let e = svgArray[i];
            //console.log(':::'+e.getAttribute('data-url'));
            let v = this.fetchSVG(e.getAttribute('data-url')).then(result => {
//console.log(e.getAttribute('data-url'));
                let temp = document.createElement('html');
                temp.innerHTML = result;
                e.innerHTML = temp.innerHTML; 
            });


        
         }
    }

    private async fetchSVG (filePath: string) {
        
        let response = await fetch(filePath, {
            method: 'GET',
            headers: {
                'Content-Type': 'image/svg+xml'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.text();

        /*.then(response => { 
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            //return response.text();
        })
        .then(text => {

           
            
            console.log(text);
            return text;
        })
        .catch(() => {
            console.error.bind(console)
        });
        */

    }
}

export default svg;