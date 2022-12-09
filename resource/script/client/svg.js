/**
 * For HMR to work, we need to export an instance of the class and not the class itself
 */
class svg {
    //i:number = 0;
    dommanipulationinstance = {};
    constructor(dommanipulationinstance) {
        this.dommanipulationinstance = dommanipulationinstance;
        //console.log(this.i);
        //this.i++; 
        this.run();
    }
    run() {
        let svgArray = this.dommanipulationinstance.body.querySelectorAll('svg[data-url]');
        let c = svgArray.length;
        //console.log(c);
        for (let i = 0; i < c; i++) {
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
    async fetchSVG(filePath) {
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
    }
}
export default svg;
